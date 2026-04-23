package com.taxis.repository

import com.taxis.entity.Usuario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UsuarioRepository : JpaRepository<Usuario, Int> {
    fun findByRolIgnoreCase(rol: String): List<Usuario>
    fun findByNoLista(noLista: Int): Usuario?
}
