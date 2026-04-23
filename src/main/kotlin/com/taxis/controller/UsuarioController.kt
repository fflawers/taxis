package com.taxis.controller

import com.taxis.dto.UsuarioRequest
import com.taxis.service.UsuarioService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/usuarios")
class UsuarioController(private val service: UsuarioService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(service.findAll())

    @GetMapping("/taxistas")
    fun getTaxistas() = ResponseEntity.ok(service.findTaxistas())

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int): ResponseEntity<*> = try {
        ResponseEntity.ok(service.findById(id))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    }

    @PostMapping
    fun create(@RequestBody req: UsuarioRequest): ResponseEntity<*> = try {
        val usuario = service.create(req)
        ResponseEntity.status(201).body(mapOf("message" to "Usuario creado exitosamente", "usuario" to usuario))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno del servidor.", "error" to e.message))
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Int, @RequestBody req: UsuarioRequest): ResponseEntity<*> = try {
        service.update(id, req)
        ResponseEntity.ok(mapOf("message" to "Usuario actualizado"))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno del servidor."))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Int): ResponseEntity<*> = try {
        service.delete(id)
        ResponseEntity.ok(mapOf("message" to "Usuario eliminado exitosamente"))
    } catch (e: NoSuchElementException) {
        ResponseEntity.status(404).body(mapOf("message" to e.message))
    } catch (e: Exception) {
        ResponseEntity.status(500).body(mapOf("message" to "Error interno del servidor."))
    }
}
