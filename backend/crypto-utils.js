// crypto-utils.js

import crypto from 'crypto';

// ✅ ¡AQUÍ ESTÁ LA CLAVE DEL PROBLEMA!
// Define tu clave de encriptación aquí. Debe ser la misma que usas para encriptar.
// DEBE TENER EXACTAMENTE 32 CARACTERES.
const ENCRYPTION_KEY = 'p7sA!Zq3#R9bK@vG*cF8xHn2$Jm5wE&T'; // 👈 REEMPLAZA ESTO

const IV_LENGTH = 16; // Para AES, esto siempre es 16

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  try {
    if (!text || typeof text !== 'string' || !text.includes(':')) {
      return text;
    }
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    // Asegúrate de que ENCRYPTION_KEY está definida arriba
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('FALLO AL DESENCRIPTAR:', `Se intentó procesar "${text}" pero falló.`, error.message);
    return text;
  }
}