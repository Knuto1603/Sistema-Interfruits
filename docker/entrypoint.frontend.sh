#!/bin/sh

# ===================================
# Script de entrada para Frontend - Railway Compatible
# Configuración optimizada para Angular SPA con PORT dinámico
# ===================================

set -e

echo "🎨 Iniciando Frontend Angular para Railway..."

# Obtener puerto de Railway o usar default
export NGINX_PORT=${PORT:-8080}
echo "📡 Configurando puerto: $NGINX_PORT"

# Generar configuración de nginx con el puerto correcto
echo "📝 Configurando Nginx..."
envsubst '${NGINX_PORT}' < /app/docker/nginx.frontend.conf.template > /etc/nginx/nginx.conf

# Verificar que existen los archivos build
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ Error: No se encontraron archivos build de Angular"
    echo "Listando contenido de /usr/share/nginx/html:"
    ls -la /usr/share/nginx/html/ || true
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
ls -la /usr/share/nginx/html/ | head -10

echo "✅ Frontend configurado correctamente en puerto $NGINX_PORT"
echo "🌐 Aplicación disponible en puerto $NGINX_PORT"

# Ejecutar comando pasado como parámetro
exec "$@"
