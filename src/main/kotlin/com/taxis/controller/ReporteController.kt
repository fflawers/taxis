package com.taxis.controller

import com.taxis.dto.ReporteRequest
import com.taxis.service.ReporteService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/reportes")
class ReporteController(private val service: ReporteService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(service.findAll())

    @GetMapping("/taxista/{id}")
    fun getByTaxista(@PathVariable id: Int) = ResponseEntity.ok(service.findByTaxista(id))

    @PostMapping
    fun create(@RequestBody req: ReporteRequest): ResponseEntity<*> = try {
        val id = service.create(req)
        ResponseEntity.status(201).body(mapOf("message" to "Reporte creado", "id" to id))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("error" to e.message))
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Int, @RequestBody req: ReporteRequest): ResponseEntity<*> = try {
        service.update(id, req)
        ResponseEntity.ok(mapOf("message" to "Reporte actualizado"))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("error" to e.message))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int): ResponseEntity<*> = try {
        service.delete(id)
        ResponseEntity.ok(mapOf("message" to "Reporte eliminado exitosamente"))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("error" to e.message))
    }
}
