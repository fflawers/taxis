package com.taxis.controller

import com.taxis.dto.AcuerdoRequest
import com.taxis.service.AcuerdoService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/acuerdos")
class AcuerdoController(private val service: AcuerdoService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(service.findAll())

    @GetMapping("/taxista/{id}")
    fun getByTaxista(@PathVariable id: Int) = ResponseEntity.ok(service.findByTaxista(id))

    @PostMapping
    fun create(@RequestBody req: AcuerdoRequest): ResponseEntity<*> = try {
        val id = service.create(req)
        ResponseEntity.status(201).body(mapOf("message" to "Acuerdo creado", "id" to id))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("error" to e.message))
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Int, @RequestBody req: AcuerdoRequest): ResponseEntity<*> = try {
        service.update(id, req)
        ResponseEntity.ok(mapOf("message" to "Acuerdo actualizado"))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("error" to e.message))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int): ResponseEntity<*> = try {
        service.delete(id)
        ResponseEntity.ok(mapOf("message" to "Acuerdo eliminado exitosamente"))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno.", "error" to e.message))
    }
}
