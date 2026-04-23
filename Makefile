.PHONY: dev build test clean logs help

# ─── Proyecto unificado: un solo Gradle + npm en la raíz ────────────────────

## Instala dependencias npm del frontend
npm-install:
	npm install

## Corre el dev server de Vite (frontend solo)
dev-frontend:
	npm run dev

## Corre el backend Kotlin (sin frontend) — conecta con el Vite dev server
dev-backend:
	./gradlew bootRun

## Desarrollo completo: Vite dev server + Spring Boot juntos
dev:
	@echo "Abriendo dos procesos..."
	@(./gradlew bootRun &) && npm run dev

## Compila el frontend (Vite build → src/main/resources/static/)
build-frontend:
	npm run build

## Compila el backend Kotlin
build-backend:
	./gradlew build -x test

## Compila TODO: frontend embebido en el JAR de Spring Boot
build:
	./gradlew build -x test

## Corre tests del backend
test:
	./gradlew test

## Limpia builds
clean:
	./gradlew clean
	rm -rf src/main/resources/static/

## Levanta todo con Docker Compose (producción local)
docker-up:
	docker compose up --build

## Detiene Docker Compose
docker-down:
	docker compose down

## Detiene y borra volúmenes de Docker (⚠️ borra la BD local)
docker-clean:
	docker compose down -v

help:
	@echo "Comandos disponibles:"
	@grep -E '^## ' Makefile | sed 's/## /  /'
