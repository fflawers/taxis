import crypto from 'crypto';

// ¡IMPORTANTE! Esta clave debe ser de 32 bytes (256 bits) y guardarse de forma segura,
// por ejemplo, en variables de entorno (process.env.ENCRYPTION_KEY).
// Nunca la dejes directamente en el código.
// Puedes generar una con: crypto.randomBytes(32).toString('hex')
const SECRET_KEY = Buffer.from('a1b2c3d4e5f6a7b8a9b0c1d2e3f4a5b6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', 'hex');
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Fallo al desencriptar:", error);
    return null;
  }
}

// Exportamos las funciones
export { encrypt, decrypt };