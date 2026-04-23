# ============================================================
# Dockerfile — Proyecto unificado Kotlin/Spring Boot + React/Vite
# El frontend se compila con Vite y queda embebido en el JAR
# ============================================================

# ── Etapa 1: Build del Frontend (Node.js) ────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copiar archivos npm
COPY package*.json ./
RUN npm ci --silent

# Copiar código fuente del frontend y configuración
COPY index.html ./
COPY vite.config.js ./
COPY eslint.config.js ./
COPY src/main/reactapp/ ./src/main/reactapp/
COPY public/ ./public/

# Build de Vite → genera archivos en src/main/resources/static/
RUN npm run build

# ── Etapa 2: Build del Backend (Gradle/Kotlin) ───────────────
FROM eclipse-temurin:17-jdk-alpine AS backend-builder

WORKDIR /app

# Copiar Gradle wrapper
COPY gradlew gradlew
COPY gradle/ gradle/
COPY build.gradle.kts build.gradle.kts
COPY settings.gradle.kts settings.gradle.kts

# Descargar dependencias (se cachea si los .kts no cambian)
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon -q || true

# Copiar código Kotlin y recursos
COPY src/main/kotlin/ src/main/kotlin/
COPY src/main/resources/ src/main/resources/


# Copiar el frontend ya compilado al lugar correcto para Spring Boot
COPY --from=frontend-builder /app/src/main/resources/static/ src/main/resources/static/

# Compilar el JAR (sin la tarea npmBuild ya que lo hicimos en la etapa anterior)
RUN ./gradlew bootJar --no-daemon -x test -x npmInstall -x npmBuild

# ── Etapa 3: Runtime (JRE slim) ──────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

COPY --from=backend-builder /app/build/libs/*.jar app.jar

ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
