package com.taxis.controller

import com.taxis.dto.TaxiRequest
import com.taxis.service.TaxiService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/taxis")
class TaxiController(private val service: TaxiService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(service.findAll())

    @PostMapping
    fun create(@RequestBody req: TaxiRequest): ResponseEntity<*> = try {
        val id = service.create(req)
        ResponseEntity.status(201).body(mapOf("message" to "Taxi creado exitosamente", "id" to id))
    } catch (e: IllegalArgumentException) {
        ResponseEntity.status(403).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno.", "error" to e.message))
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Int, @RequestBody req: TaxiRequest): ResponseEntity<*> = try {
        service.update(id, req)
        ResponseEntity.ok(mapOf("message" to "Taxi actualizado exitosamente"))
    } catch (e: IllegalArgumentException) {
        ResponseEntity.status(403).body(mapOf("message" to e.message))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno."))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int): ResponseEntity<*> = try {
        service.delete(id)
        ResponseEntity.ok(mapOf("message" to "Taxi eliminado exitosamente"))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno.", "error" to e.message))
    }
}
