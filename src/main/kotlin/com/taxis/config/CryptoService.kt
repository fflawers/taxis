package com.taxis.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * CryptoService — Equivalente a crypto-utils.js
 * Implementa AES-256-CBC compatible con el esquema de encriptación
 * ya existente en la base de datos PostgreSQL.
 *
 * Formato del texto cifrado: "<iv_hex>:<encrypted_hex>"
 */
@Service
class CryptoService(@Value("\${app.crypto.key}") private val key: String) {

    companion object {
        private const val ALGORITHM = "AES/CBC/PKCS5Padding"
        private const val IV_LENGTH = 16
    }

    /**
     * Encripta [text] usando AES-256-CBC.
     * Genera un IV aleatorio por cada llamada.
     */
    fun encrypt(text: String): String {
        val iv = ByteArray(IV_LENGTH).also { SecureRandom().nextBytes(it) }
        val cipher = buildCipher(Cipher.ENCRYPT_MODE, iv)
        val encrypted = cipher.doFinal(text.toByteArray(Charsets.UTF_8))
        return "${iv.toHex()}:${encrypted.toHex()}"
    }

    /**
     * Desencripta un [text] con formato "<iv_hex>:<encrypted_hex>".
     * Si el texto no tiene el formato esperado, lo devuelve tal cual.
     */
    fun decrypt(text: String?): String {
        if (text.isNullOrBlank() || !text.contains(':')) return text ?: ""
        return try {
            val parts = text.split(":")
            val iv = parts[0].fromHex()
            val encrypted = parts.drop(1).joinToString(":").fromHex()
            val cipher = buildCipher(Cipher.DECRYPT_MODE, iv)
            String(cipher.doFinal(encrypted), Charsets.UTF_8)
        } catch (e: Exception) {
            System.err.println("FALLO AL DESENCRIPTAR: \"$text\" — ${e.message}")
            text
        }
    }

    private fun buildCipher(mode: Int, iv: ByteArray): Cipher {
        val keySpec = SecretKeySpec(key.toByteArray(Charsets.UTF_8), "AES")
        val ivSpec = IvParameterSpec(iv)
        return Cipher.getInstance(ALGORITHM).also { it.init(mode, keySpec, ivSpec) }
    }

    private fun ByteArray.toHex(): String = joinToString("") { "%02x".format(it) }

    private fun String.fromHex(): ByteArray {
        val len = length
        val data = ByteArray(len / 2)
        for (i in 0 until len step 2) {
            data[i / 2] = ((Character.digit(this[i], 16) shl 4) +
                    Character.digit(this[i + 1], 16)).toByte()
        }
        return data
    }
}
