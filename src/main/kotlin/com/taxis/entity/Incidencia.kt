package com.taxis.entity

import jakarta.persistence.*

@Entity
@Table(name = "incidencia")
data class Incidencia(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_incidencia")
    val idIncidencia: Int = 0,

    @Column(nullable = false)
    val descripcion: String = "",

    val observaciones: String? = null,

    @Column(nullable = false)
    val estado: String = "PENDIENTE",

    @Column(name = "no_lista_conductor", nullable = false)
    val noListaConductor: Int = 0
)
