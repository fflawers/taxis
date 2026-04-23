package com.taxis.controller

import com.taxis.dto.LoginRequest
import com.taxis.dto.LoginResponse
import com.taxis.service.UsuarioService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/login")
class AuthController(private val usuarioService: UsuarioService) {

    @PostMapping
    fun login(@RequestBody req: LoginRequest): ResponseEntity<*> {
        return try {
            val response = usuarioService.login(req.noLista, req.contrasena)
            ResponseEntity.ok(response)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(401).body(mapOf("message" to e.message))
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(401).body(mapOf("message" to "Usuario o Contraseña incorrectos."))
        }
    }
}
