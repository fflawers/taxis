package com.taxis.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(name = "ingresos")
data class Ingreso(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ingreso")
    val idIngreso: Int = 0,

    @Column(name = "no_lista", nullable = false)
    val noLista: Int = 0,

    @Column(nullable = false, precision = 12, scale = 2)
    val monto: BigDecimal = BigDecimal.ZERO,

    @Column(name = "numero_viajes", nullable = false)
    val numeroViajes: Int = 0,

    @Column(nullable = false)
    val fecha: LocalDate = LocalDate.now(),

    @Column(name = "kilometraje_recorrido", nullable = false, precision = 10, scale = 2)
    val kilometrajeRecorrido: BigDecimal = BigDecimal.ZERO,

    @Column(name = "tarifa_aplicada", precision = 8, scale = 2)
    val tarifaAplicada: BigDecimal? = null,

    val anio: Int = 0,

    val mes: Int = 0
)
