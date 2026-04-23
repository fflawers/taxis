package com.taxis.repository

import com.taxis.entity.Ingreso
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IngresoRepository : JpaRepository<Ingreso, Int> {
    fun findByNoListaAndAnioAndMes(noLista: Int, anio: Int, mes: Int): List<Ingreso>
    fun findByNoLista(noLista: Int): List<Ingreso>
}
