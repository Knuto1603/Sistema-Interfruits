#!/bin/sh

# ===================================
# Script de entrada para Backend API - Railway Compatible
# Configura Symfony y inicia servicios con PORT dinámico
# ===================================

set -e

echo "🚀 Iniciando Backend API para Railway..."

# Obtener puerto de Railway o usar default
export NGINX_PORT=${PORT:-8080}
echo "📡 Configurando puerto: $NGINX_PORT"

# Generar configuración de nginx con el puerto correcto
echo "📝 Configurando Nginx..."
envsubst '${NGINX_PORT}' < /app/docker/nginx.api.conf.template > /etc/nginx/nginx.conf

# Configurar PHP-FPM
echo "📝 Configurando PHP-FPM..."
cat >> /usr/local/etc/php-fpm.d/www.conf << EOF
listen = 127.0.0.1:9000
pm = dynamic
pm.max_children = 10
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 4
EOF

# Configurar timezone
echo "🌍 Configurando timezone..."
cat >> /usr/local/etc/php/php.ini << EOF
date.timezone = America/Lima
memory_limit = 256M
upload_max_filesize = 10M
post_max_size = 10M
EOF

# Limpiar cache de Symfony para todas las apps
echo "🧹 Limpiando cache de Symfony..."
cd /app

# Cache para app principal
if [ -d "var" ]; then
    rm -rf var/cache/* || true
fi

# Cache para core app
if [ -d "apps/core/var" ]; then
    rm -rf apps/core/var/cache/* || true
fi

# Cache para security app  
if [ -d "apps/security/var" ]; then
    rm -rf apps/security/var/cache/* || true
fi

# Crear directorios de log si no existen
mkdir -p var/log apps/core/var/log apps/security/var/log

# Generar claves JWT si no existen
echo "🔑 Configurando claves JWT..."
if [ -f "/app/docker/generate-jwt-keys.sh" ]; then
    chmod +x /app/docker/generate-jwt-keys.sh
    /app/docker/generate-jwt-keys.sh || echo "⚠️ No se pudieron generar claves JWT"
fi

# Dar permisos correctos
chown -R symfony:symfony var apps/core/var apps/security/var || true

# Ejecutar migraciones si están disponibles (solo en Railway)
if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then
    echo "🗄️ Ejecutando migraciones en producción..."
    
    if [ -f "apps/core/bin/console" ]; then
        cd apps/core
        php bin/console doctrine:database:create --if-not-exists --no-interaction || true
        php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true
        cd /app
    fi

    if [ -f "apps/security/bin/console" ]; then
        cd apps/security  
        php bin/console doctrine:database:create --if-not-exists --no-interaction || true
        php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true
        cd /app
    fi
fi

# Calentar cache
echo "🔥 Calentando cache..."
if [ -f "apps/core/bin/console" ]; then
    cd apps/core && php bin/console cache:warmup --env=prod || true && cd /app
fi

if [ -f "apps/security/bin/console" ]; then
    cd apps/security && php bin/console cache:warmup --env=prod || true && cd /app
fi

# Verificar configuración de nginx
echo "🔧 Verificando configuración de Nginx..."
nginx -t

echo "✅ Backend API configurado correctamente en puerto $NGINX_PORT"
echo "🌐 Health check disponible en: http://localhost:$NGINX_PORT/health"

# Ejecutar comando pasado como parámetro
exec "$@"
