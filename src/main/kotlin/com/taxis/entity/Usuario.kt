package com.taxis.entity

import jakarta.persistence.*

@Entity
@Table(name = "usuario")
data class Usuario(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no_lista")
    val noLista: Int = 0,

    @Column(nullable = false)
    val rol: String = "",

    @Column(nullable = false)
    val contrasena: String = "",

    @Column(nullable = false)
    val nombre: String = "",

    @Column(name = "apellido_p", nullable = false)
    val apellidoP: String = "",

    @Column(name = "apellido_m")
    val apellidoM: String? = null,

    @Column(nullable = false)
    val edad: String = "",

    @Column(name = "fecha_de_nacimiento", nullable = false)
    val fechaDeNacimiento: String = "",

    @Column(nullable = false)
    val estatus: String = "Activo"
)
