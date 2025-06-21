#!/bin/bash
# Instalar dependencias de PHP
composer install --no-dev --optimize-autoloader

# Crear directorios necesarios
mkdir -p var/cache var/log
chmod 777 var/cache var/log

# Limpiar cache
php bin/console cache:clear --env=prod --no-debug

# Ejecutar migraciones (si existen)
if [ -d "migrations" ]; then
    php bin/console doctrine:migrations:migrate --no-interaction
fi
