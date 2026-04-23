package com.taxis.repository

import com.taxis.entity.Acuerdo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AcuerdoRepository : JpaRepository<Acuerdo, Int> {
    fun findByIdIncidencia(idIncidencia: Int): List<Acuerdo>
}
