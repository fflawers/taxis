package com.taxis.repository

import com.taxis.entity.Taxi
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TaxiRepository : JpaRepository<Taxi, Int> {
    fun findByNoLista(noLista: Int): List<Taxi>
}
