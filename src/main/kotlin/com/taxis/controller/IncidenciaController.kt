package com.taxis.controller

import com.taxis.dto.IncidenciaRequest
import com.taxis.dto.ResolverIncidenciaRequest
import com.taxis.service.IncidenciaService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/incidencias")
class IncidenciaController(private val service: IncidenciaService) {

    @GetMapping
    fun getAll(@RequestParam(required = false) estado: String?) =
        ResponseEntity.ok(service.findAll(estado))

    @PostMapping
    fun create(@RequestBody req: IncidenciaRequest): ResponseEntity<*> = try {
        val id = service.create(req)
        ResponseEntity.status(201).body(mapOf("message" to "Incidencia creada", "id" to id))
    } catch (e: IllegalArgumentException) {
        ResponseEntity.status(403).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno.", "error" to e.message))
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Int, @RequestBody req: IncidenciaRequest): ResponseEntity<*> = try {
        service.update(id, req)
        ResponseEntity.ok(mapOf("message" to "Incidencia actualizada"))
    } catch (e: IllegalArgumentException) {
        ResponseEntity.status(403).body(mapOf("message" to e.message))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno.", "error" to e.message))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int): ResponseEntity<*> = try {
        service.delete(id)
        ResponseEntity.ok(mapOf("message" to "Incidencia eliminada exitosamente"))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno.", "error" to e.message))
    }

    @PostMapping("/{id}/resolver")
    fun resolver(@PathVariable id: Int, @RequestBody(required = false) req: ResolverIncidenciaRequest?): ResponseEntity<*> = try {
        val idAcuerdo = service.resolver(id, req?.descripcion)
        ResponseEntity.ok(mapOf("message" to "Incidencia resuelta", "id_acuerdo" to idAcuerdo))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno"))
    }
}
