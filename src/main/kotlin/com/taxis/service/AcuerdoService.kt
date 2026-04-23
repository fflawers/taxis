package com.taxis.service

import com.taxis.dto.*
import com.taxis.entity.Acuerdo
import com.taxis.repository.AcuerdoRepository
import com.taxis.repository.IncidenciaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AcuerdoService(
    private val acuerdoRepo: AcuerdoRepository,
    private val incidenciaRepo: IncidenciaRepository
) {

    @Transactional(readOnly = true)
    fun findAll(): List<AcuerdoDto> {
        val incidencias = incidenciaRepo.findAll().associateBy { it.idIncidencia }
        return acuerdoRepo.findAll().map { a ->
            a.toDto(incidencias[a.idIncidencia]?.descripcion ?: "N/A")
        }
    }

    @Transactional(readOnly = true)
    fun findByTaxista(noLista: Int): List<AcuerdoDto> {
        val incidenciasDelTaxista = incidenciaRepo.findByNoListaConductor(noLista)
            .associateBy { it.idIncidencia }
        if (incidenciasDelTaxista.isEmpty()) return emptyList()
        return incidenciasDelTaxista.keys
            .flatMap { acuerdoRepo.findByIdIncidencia(it) }
            .map { a -> a.toDto(incidenciasDelTaxista[a.idIncidencia]?.descripcion ?: "N/A") }
    }

    @Transactional
    fun create(req: AcuerdoRequest): Int =
        acuerdoRepo.save(Acuerdo(descripcion = req.descripcion, idIncidencia = req.idIncidencia)).idAcuerdo

    @Transactional
    fun update(id: Int, req: AcuerdoRequest) {
        val existing = acuerdoRepo.findById(id).orElseThrow { NoSuchElementException("Acuerdo no encontrado") }
        acuerdoRepo.save(existing.copy(descripcion = req.descripcion, idIncidencia = req.idIncidencia))
    }

    @Transactional
    fun delete(id: Int) {
        if (!acuerdoRepo.existsById(id)) throw NoSuchElementException("Acuerdo no encontrado")
        acuerdoRepo.deleteById(id)
    }

    private fun Acuerdo.toDto(incidenciaDesc: String) = AcuerdoDto(
        idAcuerdo = idAcuerdo,
        descripcion = descripcion,
        idIncidencia = idIncidencia,
        incidenciaDescripcion = incidenciaDesc
    )
}
