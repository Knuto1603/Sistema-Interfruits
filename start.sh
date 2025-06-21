#!/bin/bash

# Iniciar backend apps/core en el puerto 8000
cd /app/apps/core
symfony server:start --no-tls --port=8000 &
cd /app

# Iniciar backend apps/security en el puerto 8001
cd /app/apps/security
symfony server:start --no-tls --port=8001 &
cd /app

# Construir Angular
cd /app/apps/frontend
npm install && npm run build
cd /app

# Iniciar nginx
nginx -g 'daemon off;'
