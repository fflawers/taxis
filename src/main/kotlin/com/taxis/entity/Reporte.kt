package com.taxis.entity

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "reporte")
data class Reporte(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    val idReporte: Int = 0,

    @Column(name = "no_lista")
    val noLista: Int? = null,

    val economico: Int? = null,

    @Column(name = "fecha_reporte")
    val fechaReporte: LocalDate? = null,

    val observaciones: String? = null,

    @Column(name = "id_incidencia")
    val idIncidencia: Int? = null,

    @Column(name = "id_acuerdo")
    val idAcuerdo: Int? = null
)
