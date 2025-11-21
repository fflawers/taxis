# ============================
# 1) Etapa de dependencias
# ============================
FROM node:18 AS builder

WORKDIR /app

# Copiamos solo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalamos todas las dependencias (incluye devDependencies)
RUN npm install

# Copiamos el resto del código
COPY . .

# ============================
# 2) Etapa final (más liviana)
# ============================
FROM node:18-slim

WORKDIR /app

# Copiamos lo construido en la etapa anterior
COPY --from=builder /app /app

# NODE_ENV = production (importante para App Runner)
ENV NODE_ENV=production
ENV PORT=3000

# Eliminamos devDependencies
RUN npm prune --production

EXPOSE 3000

# Comando final que ejecutará App Runner
CMD ["node", "server.js"]
