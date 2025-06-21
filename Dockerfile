# Dockerfile final para Railway - Symfony (core + security) + Angular + Nginx

FROM php:8.2-cli

# Variables
ENV DEBIAN_FRONTEND=noninteractive
ENV APP_ENV=prod
ENV SYMFONY_ALLOW_APP_DEV=true

# Instalación de dependencias del sistema
RUN apt-get update && apt-get install -y \
    git zip unzip curl libpq-dev libzip-dev \
    nodejs npm nginx \
    && docker-php-ext-install pdo pdo_mysql zip

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Instalar Symfony CLI
RUN curl -sS https://get.symfony.com/cli/installer | bash && \
    mv /root/.symfony*/bin/symfony /usr/local/bin/symfony

# Instalar http-server para Angular
RUN npm install -g http-server

# Crear carpeta de certificados vacíos para nginx si deseas configurar HTTPS (Railway ya lo maneja por fuera)
RUN mkdir -p /etc/nginx/certs

# Copiar todo el proyecto
WORKDIR /app
COPY . /app

# Copiar configuración de nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Dar permisos de ejecución al script
RUN chmod +x ./start.sh

# Exponer el puerto por el que Railway enruta (8080)
EXPOSE 8080

# Iniciar el script que arranca core, security y nginx
CMD ["./start.sh"]
