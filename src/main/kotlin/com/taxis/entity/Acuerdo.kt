package com.taxis.entity

import jakarta.persistence.*

@Entity
@Table(name = "acuerdo")
data class Acuerdo(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_acuerdo")
    val idAcuerdo: Int = 0,

    val descripcion: String = "",

    @Column(name = "id_incidencia", nullable = false)
    val idIncidencia: Int = 0
)
