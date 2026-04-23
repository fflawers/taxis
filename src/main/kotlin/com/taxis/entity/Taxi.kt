package com.taxis.entity

import jakarta.persistence.*

@Entity
@Table(name = "taxi")
data class Taxi(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val economico: Int = 0,

    @Column(nullable = false)
    val marca: String = "",

    @Column(nullable = false)
    val modelo: String = "",

    @Column(nullable = false)
    val anio: Int = 0,

    @Column(nullable = false)
    val placa: String = "",

    @Column(name = "no_lista")
    val noLista: Int? = null,

    @Column(nullable = false)
    val estatus: String = "Activo"
)
