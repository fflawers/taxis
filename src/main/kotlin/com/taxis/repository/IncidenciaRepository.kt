package com.taxis.repository

import com.taxis.entity.Incidencia
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IncidenciaRepository : JpaRepository<Incidencia, Int> {
    fun findByEstado(estado: String): List<Incidencia>
    fun findByNoListaConductor(noLista: Int): List<Incidencia>
}
