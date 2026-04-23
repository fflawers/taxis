package com.taxis.dto

// ── Auth ──────────────────────────────────────────────────────────────────

data class LoginRequest(
    val noLista: Int,
    val contrasena: String
)

data class LoginResponse(
    val message: String,
    val usuario: UsuarioDto,
    val rol: String
)

// ── Usuario ───────────────────────────────────────────────────────────────

/** DTO de lectura (datos ya desencriptados) */
data class UsuarioDto(
    val noLista: Int,
    val rol: String,
    val nombre: String,
    val apellidoP: String,
    val apellidoM: String?,
    val edad: Int?,
    val fechaDeNacimiento: String?,
    val estatus: String
)

/** DTO de creación / actualización */
data class UsuarioRequest(
    val rol: String,
    val contrasena: String?,
    val nombre: String,
    val apellidoP: String,
    val apellidoM: String? = null,
    val edad: Int,
    val fechaDeNacimiento: String,
    val estatus: String = "Activo"
)

/** DTO ligero para listas de taxistas */
data class TaxistaDto(
    val noLista: Int,
    val rol: String,
    val nombre: String,
    val apellidoP: String
)

// ── Taxi ──────────────────────────────────────────────────────────────────

data class TaxiDto(
    val economico: Int,
    val marca: String,
    val modelo: String,
    val año: Int,
    val placa: String,           // Desencriptado
    val noLista: Int?,
    val estatus: String,
    val nombreConductor: String
)

data class TaxiRequest(
    val marca: String,
    val modelo: String,
    val año: Int,
    val placa: String,
    val noLista: Int? = null,
    val estatus: String = "Activo"
)

// ── Incidencia ────────────────────────────────────────────────────────────

data class IncidenciaDto(
    val idIncidencia: Int,
    val descripcion: String,
    val observaciones: String,
    val estado: String,
    val noLista: Int,
    val nombreConductor: String
)

data class IncidenciaRequest(
    val descripcion: String,
    val observaciones: String? = null,
    val noLista: Int
)

data class ResolverIncidenciaRequest(
    val descripcion: String? = null
)

// ── Acuerdo ───────────────────────────────────────────────────────────────

data class AcuerdoDto(
    val idAcuerdo: Int,
    val descripcion: String,
    val idIncidencia: Int,
    val incidenciaDescripcion: String
)

data class AcuerdoRequest(
    val descripcion: String,
    val idIncidencia: Int
)

// ── Reporte ───────────────────────────────────────────────────────────────

data class ReporteDto(
    val idReporte: Int,
    val fechaReporte: String?,
    val observaciones: String?,
    val noLista: Int?,
    val economico: Int?,
    val idIncidencia: Int?,
    val idAcuerdo: Int?,
    val nombreConductor: String,
    val placaTaxi: String,
    val incidenciaDescripcion: String,
    val acuerdoDescripcion: String
)

data class ReporteRequest(
    val noLista: Int?,
    val economico: Int?,
    val fechaReporte: String?,
    val observaciones: String?,
    val idIncidencia: Int?,
    val idAcuerdo: Int?
)

// ── Ingreso ───────────────────────────────────────────────────────────────

data class IngresoRequest(
    val noLista: Int,
    val kilometrajeRecorrido: Double,
    val numeroViajes: Int,
    val fecha: String
)

data class IngresoResumenDto(
    val totalViajes: Long,
    val ingresosTotales: Double,
    val kmTotales: Double
)

// ── Mensajes genéricos ────────────────────────────────────────────────────

data class MessageResponse(val message: String)
data class CreatedResponse(val message: String, val id: Int)
