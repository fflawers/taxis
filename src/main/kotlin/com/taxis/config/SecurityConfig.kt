package com.taxis.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

/**
 * SecurityConfig — Configuración de seguridad.
 *
 * Estado actual:
 * - BCrypt para contraseñas
 * - CORS restringido al dominio(s) del frontend
 * - CSRF deshabilitado (API REST stateless — correcto para tokens en el futuro)
 * - Endpoints públicos: /login, /actuator/health, recursos estáticos (frontend)
 * - Resto de endpoints: requireAuthenticated (TODO: implementar JWT)
 */
@Configuration
@EnableWebSecurity
class SecurityConfig {

    // Dominio(s) permitidos en CORS — se configura desde application.properties o env var
    @Value("\${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private lateinit var allowedOrigins: String

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(10)

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    // Preflight CORS
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    // Salud del servicio
                    .requestMatchers("/actuator/health").permitAll()
                    // Login público
                    .requestMatchers(HttpMethod.POST, "/login").permitAll()
                    // Frontend estático (React SPA)
                    .requestMatchers("/", "/index.html", "/assets/**", "/*.js", "/*.css", "/*.ico", "/*.png").permitAll()
                    // Rutas del SPA (React Router)
                    .requestMatchers(
                        "/inicio", "/dashbor", "/gestion", "/usuarios", "/taxis",
                        "/incidencias", "/acuerdo", "/reports", "/taxistas",
                        "/reportes", "/resolution", "/ingresos"
                    ).permitAll()
                    // TODO: una vez implementado JWT, cambiar a .authenticated()
                    .anyRequest().permitAll()
            }
        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val origins = allowedOrigins.split(",").map { it.trim() }
        val config = CorsConfiguration().apply {
            allowedOrigins = origins
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("Content-Type", "Authorization", "X-Requested-With")
            allowCredentials = true
            maxAge = 3600L // cachea preflight 1 hora
        }
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/api/**", config)
            registerCorsConfiguration("/**", config)
        }
    }
}
