# Security API - Simple & Clean
FROM php:8.2-cli-alpine

# Install dependencies
RUN apk add --no-cache git unzip
RUN docker-php-ext-install pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Setup app
WORKDIR /app
COPY composer*.json ./
RUN composer install --no-dev --optimize-autoloader --no-scripts || composer install --no-dev
COPY . .

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public/"]
