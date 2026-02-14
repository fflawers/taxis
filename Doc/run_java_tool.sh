#!/bin/bash
# Wrapper para ejecutar la herramienta Java fácilmente

cd confluence-tool
# Compilar silenciosamente y ejecutar
mvn -q clean compile exec:java
cd ..
