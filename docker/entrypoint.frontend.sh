#!/bin/sh

# ===================================
# Script de entrada para Frontend
# Configuración optimizada para Angular SPA
# ===================================

set -e

echo "🎨 Iniciando Frontend Angular..."

# Verificar que existen los archivos build
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ Error: No se encontraron archivos build de Angular"
    echo "Asegúrate de que 'npm run build' se ejecutó correctamente"
    exit 1
fi

# Configurar timezone
echo "🌍 Configurando timezone..."
export TZ=America/Lima

# Crear directorio temporal para nginx
mkdir -p /tmp/nginx

# Verificar configuración de nginx
echo "🔧 Verificando configuración de Nginx..."
nginx -t

# Log de archivos estáticos encontrados
echo "📁 Archivos estáticos encontrados:"
ls -la /usr/share/nginx/html/

echo "✅ Frontend configurado correctamente"
echo "🌐 Servidor listo en puerto 8080"

# Ejecutar comando pasado como parámetro
exec "$@"
