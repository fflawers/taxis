package com.taxis.controller

import com.taxis.dto.IngresoRequest
import com.taxis.service.IngresoService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/ingresos")
class IngresoController(private val service: IngresoService) {

    @PostMapping
    fun registrar(@RequestBody req: IngresoRequest): ResponseEntity<*> = try {
        val result = service.registrar(req)
        ResponseEntity.ok(result)
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("error" to e.message))
    }

    @GetMapping("/taxista/{id}")
    fun resumenTaxista(
        @PathVariable id: Int,
        @RequestParam mes: Int,
        @RequestParam anio: Int
    ): ResponseEntity<*> = try {
        ResponseEntity.ok(service.resumenTaxista(id, mes, anio))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("error" to e.message))
    }
}
