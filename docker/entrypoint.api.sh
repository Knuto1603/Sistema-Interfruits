#!/bin/sh

# ===================================
# Script de entrada para Backend API
# Configura Symfony y inicia servicios
# ===================================

set -e

echo "🚀 Iniciando Backend API..."

# Configurar PHP-FPM
echo "📝 Configurando PHP-FPM..."
echo "listen = 127.0.0.1:9000" >> /usr/local/etc/php-fpm.d/www.conf
echo "pm = dynamic" >> /usr/local/etc/php-fpm.d/www.conf
echo "pm.max_children = 10" >> /usr/local/etc/php-fpm.d/www.conf
echo "pm.start_servers = 3" >> /usr/local/etc/php-fpm.d/www.conf
echo "pm.min_spare_servers = 2" >> /usr/local/etc/php-fpm.d/www.conf
echo "pm.max_spare_servers = 4" >> /usr/local/etc/php-fpm.d/www.conf

# Configurar timezone
echo "🌍 Configurando timezone..."
echo "date.timezone = America/Lima" >> /usr/local/etc/php/php.ini

# Limpiar cache de Symfony para todas las apps
echo "🧹 Limpiando cache de Symfony..."
cd /app

# Cache para app principal
if [ -d "var" ]; then
    rm -rf var/cache/*
fi

# Cache para core app
if [ -d "apps/core/var" ]; then
    rm -rf apps/core/var/cache/*
fi

# Cache para security app  
if [ -d "apps/security/var" ]; then
    rm -rf apps/security/var/cache/*
fi

# Crear directorios de log si no existen
mkdir -p var/log apps/core/var/log apps/security/var/log

# Ejecutar migraciones si están disponibles
echo "🗄️ Ejecutando migraciones..."
if [ -f "apps/core/bin/console" ]; then
    cd apps/core
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true
    cd /app
fi

if [ -f "apps/security/bin/console" ]; then
    cd apps/security  
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true
    cd /app
fi

# Calentar cache
echo "🔥 Calentando cache..."
if [ -f "apps/core/bin/console" ]; then
    cd apps/core && php bin/console cache:warmup && cd /app
fi

if [ -f "apps/security/bin/console" ]; then
    cd apps/security && php bin/console cache:warmup && cd /app
fi

echo "✅ Backend API configurado correctamente"

# Ejecutar comando pasado como parámetro
exec "$@"
