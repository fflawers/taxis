package com.taxis.config

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

/**
 * SpaController — Reenvía todas las rutas no-API al index.html de React.
 * Necesario para que React Router funcione cuando el usuario recarga
 * páginas como /usuarios, /taxis, etc.
 *
 * Las rutas de la API (/login, /usuarios, /taxis, etc.) son atendidas
 * por los @RestController antes de llegar aquí.
 */
@Controller
class SpaController {

    @RequestMapping(value = [
        "/inicio", "/dashbor", "/gestion", "/usuarios", "/taxis",
        "/incidencias", "/acuerdo", "/reports", "/taxistas",
        "/reportes", "/resolution", "/ingresos"
    ])
    fun forwardSpaRoutes(): String = "forward:/index.html"
}
