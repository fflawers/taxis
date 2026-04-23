package com.taxis

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class TaxisApplication

fun main(args: Array<String>) {
    runApplication<TaxisApplication>(*args)
}
