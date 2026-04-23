package com.taxis.repository

import com.taxis.entity.Reporte
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ReporteRepository : JpaRepository<Reporte, Int> {
    fun findByNoLista(noLista: Int): List<Reporte>
}
