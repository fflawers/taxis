#!/bin/bash
echo "Preparando Kit de Migración Java..."

# 1. Instalar Mermaid (necesario para la conversión de gráficas)
if [ ! -f "package.json" ]; then
    echo "{}" > package.json
fi
echo "Instalando motor de Mermaid..."
npm install @mermaid-js/mermaid-cli puppeteer

# 2. Compilar herramienta Java
echo "Compilando herramienta Java..."
cd confluence-tool
mvn -q clean compile
cd ..

echo "Todo listo."
echo "Ejecuta: ./run_java_tool.sh"
