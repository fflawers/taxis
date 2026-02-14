# 🤖 Guía de Automatización: Herramienta de Migración Java

Esta herramienta unificada convierte tus diagramas Mermaid a imágenes y publica toda tu documentación en Confluence con un solo comando.

## 🛠 Requisitos Previos

1.  **Java 11+** y **Maven** instalados.
2.  **Node.js** instalado (necesario internamente para convertir gráficas).
3.  **API Token de Atlassian** ([Obtener aquí](https://id.atlassian.com/manage-profile/security/api-tokens)).

## 🚀 Cómo usar la herramienta

### 1. Preparación Inicial
Si es la primera vez que la usas en este equipo:

```bash
cd Doc
./setup_java.sh
```
*(Esto instalará el motor de Mermaid y compilará el proyecto Java).*

### 2. Ejecución Diaria
Para publicar tu documentación:

```bash
./run_java_tool.sh
```

La herramienta te pedirá interactivamente:
- URL de Confluence
- Email
- API Token
- Space Key (ej. `DDF`)

Y procesará automáticamente todos los archivos listados en `migration_config.json`.

---

## 📦 Kit de Migración (Portabilidad)

Para llevar esta solución a otro repositorio, copia estos elementos:

| Archivo/Carpeta | Descripción |
|-----------------|-------------|
| `confluence-tool/` | Código fuente Java (Maven Project). |
| `migration_config.json` | Tu configuración de qué archivos migrar. |
| `setup_java.sh` | Script de instalación de dependencias. |
| `run_java_tool.sh` | Script de ejecución. |

### Pasos en el nuevo proyecto:
1. Copia los archivos a tu carpeta de documentación.
2. Ejecuta `./setup_java.sh`.
3. Edita `migration_config.json` con tus propios archivos Markdown.
4. corre `./run_java_tool.sh`.
