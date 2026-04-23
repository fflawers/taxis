package com.taxis.service

import com.taxis.config.CryptoService
import com.taxis.dto.*
import com.taxis.entity.Usuario
import com.taxis.repository.UsuarioRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UsuarioService(
    private val repo: UsuarioRepository,
    private val crypto: CryptoService,
    private val passwordEncoder: PasswordEncoder
) {

    // ── Autenticación ─────────────────────────────────────────────────────

    fun login(noLista: Int, contrasena: String): LoginResponse {
        val usuario = repo.findById(noLista).orElseThrow {
            IllegalArgumentException("Usuario o Contraseña incorrectos.")
        }
        if (!passwordEncoder.matches(contrasena, usuario.contrasena)) {
            throw IllegalArgumentException("Usuario o Contraseña incorrectos.")
        }
        val dto = usuario.toDto()
        return LoginResponse(
            message = "Inicio de sesión exitoso",
            usuario = dto,
            rol = dto.rol
        )
    }

    // ── CRUD ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    fun findAll(): List<UsuarioDto> = repo.findAll().map { it.toDto() }

    @Transactional(readOnly = true)
    fun findById(id: Int): UsuarioDto =
        repo.findById(id).orElseThrow { NoSuchElementException("Usuario no encontrado") }.toDto()

    @Transactional(readOnly = true)
    fun findTaxistas(): List<TaxistaDto> = repo.findByRolIgnoreCase("taxista").map { u ->
        TaxistaDto(
            noLista = u.noLista,
            rol = u.rol,
            nombre = crypto.decrypt(u.nombre),
            apellidoP = crypto.decrypt(u.apellidoP)
        )
    }

    @Transactional
    fun create(req: UsuarioRequest): UsuarioDto {
        val entity = Usuario(
            rol = req.rol,
            contrasena = passwordEncoder.encode(req.contrasena ?: error("Contraseña requerida")),
            nombre = crypto.encrypt(req.nombre),
            apellidoP = crypto.encrypt(req.apellidoP),
            apellidoM = req.apellidoM?.let { crypto.encrypt(it) },
            edad = crypto.encrypt(req.edad.toString()),
            fechaDeNacimiento = crypto.encrypt(req.fechaDeNacimiento),
            estatus = req.estatus
        )
        return repo.save(entity).toDto()
    }

    @Transactional
    fun update(id: Int, req: UsuarioRequest): UsuarioDto {
        val existing = repo.findById(id).orElseThrow { NoSuchElementException("Usuario no encontrado") }
        val updated = existing.copy(
            rol = req.rol,
            contrasena = if (!req.contrasena.isNullOrBlank())
                passwordEncoder.encode(req.contrasena) else existing.contrasena,
            nombre = crypto.encrypt(req.nombre),
            apellidoP = crypto.encrypt(req.apellidoP),
            apellidoM = req.apellidoM?.let { crypto.encrypt(it) },
            edad = crypto.encrypt(req.edad.toString()),
            fechaDeNacimiento = crypto.encrypt(req.fechaDeNacimiento),
            estatus = req.estatus
        )
        return repo.save(updated).toDto()
    }

    @Transactional
    fun delete(id: Int) {
        if (!repo.existsById(id)) throw NoSuchElementException("Usuario no encontrado")
        repo.deleteById(id)
    }

    // ── Mapeo privado ─────────────────────────────────────────────────────

    private fun Usuario.toDto() = UsuarioDto(
        noLista = noLista,
        rol = rol,
        nombre = crypto.decrypt(nombre),
        apellidoP = crypto.decrypt(apellidoP),
        apellidoM = apellidoM?.let { crypto.decrypt(it) },
        edad = try { crypto.decrypt(edad).toIntOrNull() } catch (e: Exception) { null },
        fechaDeNacimiento = try { crypto.decrypt(fechaDeNacimiento) } catch (e: Exception) { null },
        estatus = estatus
    )
}
