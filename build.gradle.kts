import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.3.5"
    id("io.spring.dependency-management") version "1.1.6"
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    kotlin("plugin.jpa") version "1.9.25"
}

group = "com.taxis"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

dependencies {
    // ── Spring Boot ────────────────────────────────────────
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // ── Base de datos ──────────────────────────────────────
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // ── Kotlin ─────────────────────────────────────────────
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // ── Tests ──────────────────────────────────────────────
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}

// ================================================================
// Tareas npm — construye el frontend React y lo copia a resources/static
// En producción (bootJar) el frontend queda embebido en el JAR
// ================================================================

val npmInstall by tasks.registering(Exec::class) {
    description = "Instala dependencias npm del frontend"
    group = "frontend"
    commandLine("npm", "install")
    inputs.file("package.json")
    outputs.dir("node_modules")
}

val npmBuild by tasks.registering(Exec::class) {
    description = "Compila el frontend React con Vite"
    group = "frontend"
    dependsOn(npmInstall)
    commandLine("npm", "run", "build")
    inputs.dir("src/main/reactapp")
    inputs.file("index.html")
    inputs.file("vite.config.js")
    outputs.dir("src/main/resources/static")
}

// ── Producción: el JAR incluye el frontend compilado ─────────
// npmBuild sólo corre al hacer bootJar (./gradlew build o bootJar)
// NO corre en bootRun ni en compileKotlin (más rápido en desarrollo)
tasks.named("bootJar") {
    dependsOn(npmBuild)
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs += "-Xjsr305=strict"
        jvmTarget = "17"
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
