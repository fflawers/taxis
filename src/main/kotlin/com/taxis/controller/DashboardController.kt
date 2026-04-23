package com.taxis.controller

import com.taxis.config.CryptoService
import com.taxis.repository.IngresoRepository
import com.taxis.repository.ReporteRepository
import com.taxis.repository.TaxiRepository
import com.taxis.repository.UsuarioRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
class DashboardController(
    private val usuarioRepo: UsuarioRepository,
    private val taxiRepo: TaxiRepository,
    private val reporteRepo: ReporteRepository,
    private val ingresoRepo: IngresoRepository,
    private val crypto: CryptoService
) {

    /** Tiempo de BD — equivalente a GET /prueba */
    @GetMapping("/prueba")
    fun prueba() = ResponseEntity.ok(mapOf("ok" to true, "time" to System.currentTimeMillis()))

    /** Dashboard analítico: ingresos_top, viajes_top, choferes_reportados, resumen_30_dias */
    @GetMapping("/dashboard/analisis/{modulo}")
    fun analisis(@PathVariable modulo: String): ResponseEntity<*> {
        return try {
            when (modulo) {
                "resumen_30_dias" -> {
                    val hace30 = LocalDate.now().minusDays(30)
                    val totalReportes = reporteRepo.findAll()
                        .count { it.fechaReporte != null && !it.fechaReporte.isBefore(hace30) }
                    val totalTaxistas = usuarioRepo.findByRolIgnoreCase("taxista").size
                    val totalTaxis = taxiRepo.count()
                    ResponseEntity.ok(listOf(mapOf(
                        "total_reportes" to totalReportes,
                        "total_taxistas" to totalTaxistas,
                        "total_taxis" to totalTaxis
                    )))
                }
                else -> ResponseEntity.status(400).body(mapOf("message" to "Módulo no válido"))
            }
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to e.message))
        }
    }

    /** GET /dashboard/ingresos-mensuales */
    @GetMapping("/dashboard/ingresos-mensuales")
    fun ingresosMensuales(): ResponseEntity<*> {
        return try {
            val now = LocalDate.now()
            val ingresos = ingresoRepo.findAll()
                .filter { it.anio == now.year && it.mes == now.monthValue }
            val totalViajes = ingresos.sumOf { it.numeroViajes }
            val totalKm = ingresos.sumOf { it.kilometrajeRecorrido.toDouble() }
            val totalIngreso = ingresos.sumOf { it.monto.toDouble() }
            ResponseEntity.ok(mapOf(
                "total_viajes" to totalViajes,
                "total_km" to totalKm,
                "total_ingreso" to totalIngreso
            ))
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to e.message))
        }
    }

    /** GET /dashboard/viajes-top */
    @GetMapping("/dashboard/viajes-top")
    fun viajesTop(): ResponseEntity<*> {
        return try {
            val hace30 = LocalDate.now().minusDays(30)
            val usuarios = usuarioRepo.findAll().associateBy { it.noLista }
            val ranking = ingresoRepo.findAll()
                .filter { it.fecha.isAfter(hace30) || it.fecha == hace30 }
                .groupBy { it.noLista }
                .map { (noLista, ingresos) ->
                    val usuario = usuarios[noLista]
                    val nombre = usuario?.let { crypto.decrypt(it.nombre) } ?: "Desconocido"
                    mapOf("nombre" to nombre, "total_viajes" to ingresos.sumOf { it.numeroViajes })
                }
                .sortedByDescending { (it["total_viajes"] as Int) }
                .take(10)
            ResponseEntity.ok(ranking)
        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to e.message))
        }
    }
}
