package com.taxis.controller

import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

/**
 * Manejador global de excepciones.
 * Transforma excepciones de lógica de negocio y de BD a respuestas HTTP apropiadas.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException::class)
    fun handleNotFound(e: NoSuchElementException) =
        ResponseEntity.status(404).body(mapOf("message" to (e.message ?: "Recurso no encontrado")))

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException) =
        ResponseEntity.status(400).body(mapOf("message" to (e.message ?: "Petición inválida")))

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrity(e: DataIntegrityViolationException): ResponseEntity<*> {
        // FK violation (código 23503 en PostgreSQL)
        return if (e.message?.contains("23503") == true) {
            ResponseEntity.status(400).body(mapOf("message" to "No se puede eliminar: el recurso está en uso."))
        } else {
            ResponseEntity.status(500).body(mapOf("message" to "Error de integridad de datos."))
        }
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneral(e: Exception): ResponseEntity<*> {
        System.err.println("Error no manejado: ${e.message}")
        return ResponseEntity.status(500).body(mapOf("message" to "Error interno del servidor."))
    }
}
