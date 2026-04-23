package com.taxis.service

import com.taxis.config.CryptoService
import com.taxis.dto.*
import com.taxis.entity.Acuerdo
import com.taxis.entity.Incidencia
import com.taxis.repository.AcuerdoRepository
import com.taxis.repository.IncidenciaRepository
import com.taxis.repository.UsuarioRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class IncidenciaService(
    private val incidenciaRepo: IncidenciaRepository,
    private val acuerdoRepo: AcuerdoRepository,
    private val usuarioRepo: UsuarioRepository,
    private val crypto: CryptoService
) {

    @Transactional(readOnly = true)
    fun findAll(estado: String? = null): List<IncidenciaDto> {
        val incidencias = if (estado != null) incidenciaRepo.findByEstado(estado)
                          else incidenciaRepo.findAll()
        val usuarios = usuarioRepo.findAll().associateBy { it.noLista }
        return incidencias.sortedByDescending { it.idIncidencia }.map { inc ->
            val conductor = usuarios[inc.noListaConductor]
            val nombreConductor = conductor?.let {
                try {
                    "${crypto.decrypt(it.nombre)} ${crypto.decrypt(it.apellidoP)}"
                } catch (e: Exception) { "Error de datos" }
            } ?: "Sin asignar"
            inc.toDto(nombreConductor)
        }
    }

    @Transactional
    fun create(req: IncidenciaRequest): Int {
        validateTaxista(req.noLista)
        val entity = Incidencia(
            descripcion = req.descripcion,
            observaciones = req.observaciones,
            noListaConductor = req.noLista
        )
        return incidenciaRepo.save(entity).idIncidencia
    }

    @Transactional
    fun update(id: Int, req: IncidenciaRequest) {
        val existing = incidenciaRepo.findById(id).orElseThrow { NoSuchElementException("Incidencia no encontrada") }
        validateTaxista(req.noLista)
        incidenciaRepo.save(
            existing.copy(descripcion = req.descripcion, observaciones = req.observaciones, noListaConductor = req.noLista)
        )
    }

    @Transactional
    fun delete(id: Int) {
        if (!incidenciaRepo.existsById(id)) throw NoSuchElementException("Incidencia no encontrada")
        incidenciaRepo.deleteById(id)
    }

    @Transactional
    fun resolver(id: Int, descripcion: String?): Int {
        val incidencia = incidenciaRepo.findById(id).orElseThrow { NoSuchElementException("Incidencia no encontrada") }
        val acuerdo = acuerdoRepo.save(Acuerdo(descripcion = descripcion ?: "", idIncidencia = id))
        incidenciaRepo.save(incidencia.copy(estado = "RESUELTA"))
        return acuerdo.idAcuerdo
    }

    private fun validateTaxista(noLista: Int) {
        val usuario = usuarioRepo.findById(noLista).orElseThrow {
            IllegalArgumentException("El usuario seleccionado no es un taxista.")
        }
        if (!usuario.rol.equals("taxista", ignoreCase = true)) {
            throw IllegalArgumentException("Operación no permitida: El usuario seleccionado no es un taxista.")
        }
    }

    private fun Incidencia.toDto(nombreConductor: String) = IncidenciaDto(
        idIncidencia = idIncidencia,
        descripcion = descripcion,
        observaciones = observaciones ?: "",
        estado = estado,
        noLista = noListaConductor,
        nombreConductor = nombreConductor
    )
}
