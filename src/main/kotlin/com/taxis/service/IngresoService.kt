package com.taxis.service

import com.taxis.dto.IngresoRequest
import com.taxis.dto.IngresoResumenDto
import com.taxis.entity.Ingreso
import com.taxis.repository.IngresoRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Service
class IngresoService(private val ingresoRepo: IngresoRepository) {

    companion object {
        private val TARIFA_POR_KM = BigDecimal("25") // MXN por km
    }

    @Transactional
    fun registrar(req: IngresoRequest): Ingreso {
        val fecha = LocalDate.parse(req.fecha)
        val anio = fecha.year
        val mes = fecha.monthValue
        val km = BigDecimal(req.kilometrajeRecorrido)
        val monto = km.multiply(TARIFA_POR_KM)

        val existing = ingresoRepo.findByNoListaAndAnioAndMes(req.noLista, anio, mes)

        return if (existing.isNotEmpty()) {
            // Acumular al registro existente del mismo mes
            val e = existing.first()
            ingresoRepo.save(
                e.copy(
                    numeroViajes = e.numeroViajes + req.numeroViajes,
                    kilometrajeRecorrido = e.kilometrajeRecorrido.add(km),
                    monto = e.monto.add(monto)
                )
            )
        } else {
            // Crear nuevo registro mensual
            ingresoRepo.save(
                Ingreso(
                    noLista = req.noLista,
                    monto = monto,
                    numeroViajes = req.numeroViajes,
                    fecha = fecha,
                    kilometrajeRecorrido = km,
                    tarifaAplicada = TARIFA_POR_KM,
                    anio = anio,
                    mes = mes
                )
            )
        }
    }

    @Transactional(readOnly = true)
    fun resumenTaxista(noLista: Int, mes: Int, anio: Int): IngresoResumenDto {
        val ingresos = ingresoRepo.findByNoListaAndAnioAndMes(noLista, anio, mes)
        return IngresoResumenDto(
            totalViajes = ingresos.sumOf { it.numeroViajes }.toLong(),
            ingresosTotales = ingresos.sumOf { it.monto.toDouble() },
            kmTotales = ingresos.sumOf { it.kilometrajeRecorrido.toDouble() }
        )
    }
}
