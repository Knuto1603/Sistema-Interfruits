# Iniciar backend apps/core en el puerto 8000
symfony server:start --no-tls --port=8000 --dir=apps/core &

# Iniciar backend apps/security en el puerto 8001
symfony server:start --no-tls --port=8001 --dir=apps/security &

# Construir Angular
cd apps/frontend
npm install && npm run build
cd ../../

# Iniciar nginx para enrutar todo a /api/core, /api/security, y servir Angular
nginx -g 'daemon off;'
