package com.taxis.service

import com.taxis.config.CryptoService
import com.taxis.dto.*
import com.taxis.entity.Taxi
import com.taxis.repository.TaxiRepository
import com.taxis.repository.UsuarioRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TaxiService(
    private val taxiRepo: TaxiRepository,
    private val usuarioRepo: UsuarioRepository,
    private val crypto: CryptoService
) {

    @Transactional(readOnly = true)
    fun findAll(): List<TaxiDto> {
        val taxis = taxiRepo.findAll()
        val usuarios = usuarioRepo.findAll().associateBy { it.noLista }
        return taxis.map { taxi ->
            val conductor = taxi.noLista?.let { usuarios[it] }
            val nombre = conductor?.nombre?.let { crypto.decrypt(it) }
            val apellido = conductor?.apellidoP?.let { crypto.decrypt(it) }
            taxi.toDto(
                nombreConductor = if (nombre != null && apellido != null) "$nombre $apellido" else "Sin asignar"
            )
        }
    }

    @Transactional
    fun create(req: TaxiRequest): Int {
        // Validar que el conductor sea taxista
        if (req.noLista != null) validateTaxista(req.noLista)
        val entity = Taxi(
            marca = req.marca,
            modelo = req.modelo,
            anio = req.año,
            placa = crypto.encrypt(req.placa),
            noLista = req.noLista,
            estatus = req.estatus
        )
        return taxiRepo.save(entity).economico
    }

    @Transactional
    fun update(id: Int, req: TaxiRequest) {
        val existing = taxiRepo.findById(id).orElseThrow { NoSuchElementException("Taxi no encontrado") }
        if (req.noLista != null) validateTaxista(req.noLista)
        val updated = existing.copy(
            marca = req.marca,
            modelo = req.modelo,
            anio = req.año,
            placa = crypto.encrypt(req.placa),
            noLista = req.noLista,
            estatus = req.estatus
        )
        taxiRepo.save(updated)
    }

    @Transactional
    fun delete(id: Int) {
        if (!taxiRepo.existsById(id)) throw NoSuchElementException("Taxi no encontrado")
        taxiRepo.deleteById(id)
    }

    private fun validateTaxista(noLista: Int) {
        val usuario = usuarioRepo.findById(noLista).orElseThrow {
            IllegalArgumentException("El conductor asignado debe ser un taxista.")
        }
        if (!usuario.rol.equals("taxista", ignoreCase = true)) {
            throw IllegalArgumentException("El conductor asignado debe ser un taxista.")
        }
    }

    private fun Taxi.toDto(nombreConductor: String) = TaxiDto(
        economico = economico,
        marca = marca,
        modelo = modelo,
        año = anio,
        placa = crypto.decrypt(placa),
        noLista = noLista,
        estatus = estatus,
        nombreConductor = nombreConductor
    )
}
