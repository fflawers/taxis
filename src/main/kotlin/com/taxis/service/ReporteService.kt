package com.taxis.service

import com.taxis.config.CryptoService
import com.taxis.dto.*
import com.taxis.entity.Reporte
import com.taxis.repository.AcuerdoRepository
import com.taxis.repository.IncidenciaRepository
import com.taxis.repository.ReporteRepository
import com.taxis.repository.TaxiRepository
import com.taxis.repository.UsuarioRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class ReporteService(
    private val reporteRepo: ReporteRepository,
    private val usuarioRepo: UsuarioRepository,
    private val taxiRepo: TaxiRepository,
    private val incidenciaRepo: IncidenciaRepository,
    private val acuerdoRepo: AcuerdoRepository,
    private val crypto: CryptoService
) {

    @Transactional(readOnly = true)
    fun findAll(): List<ReporteDto> {
        val usuarios = usuarioRepo.findAll().associateBy { it.noLista }
        val taxis = taxiRepo.findAll().associateBy { it.economico }
        val incidencias = incidenciaRepo.findAll().associateBy { it.idIncidencia }
        val acuerdos = acuerdoRepo.findAll().associateBy { it.idAcuerdo }

        return reporteRepo.findAll().map { r ->
            val usuario = r.noLista?.let { usuarios[it] }
            val taxi = r.economico?.let { taxis[it] }
            val incidencia = r.idIncidencia?.let { incidencias[it] }
            val acuerdo = r.idAcuerdo?.let { acuerdos[it] }

            val nombreConductor = usuario?.let {
                try { "${crypto.decrypt(it.nombre)} ${crypto.decrypt(it.apellidoP)}" }
                catch (e: Exception) { "Error de datos" }
            } ?: "N/A"

            val placaTaxi = taxi?.placa?.let { crypto.decrypt(it) } ?: "N/A"

            ReporteDto(
                idReporte = r.idReporte,
                fechaReporte = r.fechaReporte?.toString(),
                observaciones = r.observaciones,
                noLista = r.noLista,
                economico = r.economico,
                idIncidencia = r.idIncidencia,
                idAcuerdo = r.idAcuerdo,
                nombreConductor = nombreConductor,
                placaTaxi = placaTaxi,
                incidenciaDescripcion = incidencia?.descripcion ?: "N/A",
                acuerdoDescripcion = acuerdo?.descripcion ?: "N/A"
            )
        }
    }

    @Transactional(readOnly = true)
    fun findByTaxista(noLista: Int): List<ReporteDto> {
        val taxis = taxiRepo.findAll().associateBy { it.economico }
        val incidencias = incidenciaRepo.findAll().associateBy { it.idIncidencia }
        return reporteRepo.findByNoLista(noLista).map { r ->
            val placa = r.economico?.let { taxis[it]?.placa?.let { p -> crypto.decrypt(p) } } ?: "N/A"
            ReporteDto(
                idReporte = r.idReporte,
                fechaReporte = r.fechaReporte?.toString(),
                observaciones = r.observaciones,
                noLista = r.noLista,
                economico = r.economico,
                idIncidencia = r.idIncidencia,
                idAcuerdo = r.idAcuerdo,
                nombreConductor = "",
                placaTaxi = placa,
                incidenciaDescripcion = r.idIncidencia?.let { incidencias[it]?.descripcion } ?: "N/A",
                acuerdoDescripcion = "N/A"
            )
        }
    }

    @Transactional
    fun create(req: ReporteRequest): Int {
        val entity = Reporte(
            noLista = req.noLista,
            economico = req.economico,
            fechaReporte = req.fechaReporte?.let { LocalDate.parse(it) },
            observaciones = req.observaciones,
            idIncidencia = req.idIncidencia,
            idAcuerdo = req.idAcuerdo
        )
        return reporteRepo.save(entity).idReporte
    }

    @Transactional
    fun update(id: Int, req: ReporteRequest) {
        val existing = reporteRepo.findById(id).orElseThrow { NoSuchElementException("Reporte no encontrado") }
        reporteRepo.save(existing.copy(
            noLista = req.noLista,
            economico = req.economico,
            fechaReporte = req.fechaReporte?.let { LocalDate.parse(it) },
            observaciones = req.observaciones,
            idIncidencia = req.idIncidencia,
            idAcuerdo = req.idAcuerdo
        ))
    }

    @Transactional
    fun delete(id: Int) {
        if (!reporteRepo.existsById(id)) throw NoSuchElementException("Reporte no encontrado")
        reporteRepo.deleteById(id)
    }
}
