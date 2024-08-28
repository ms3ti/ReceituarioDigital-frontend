# Build do Node
FROM debian:11-slim AS builder
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &&\
    apt-get install nodejs -y
RUN apt-get install -y build-essential
WORKDIR /
COPY ./package.json ./
RUN npm install --force
COPY . .
RUN npm run build
# Construção da imagem do Front
FROM debian:11-slim
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install apache2 -y
COPY apache/000-default.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite
COPY html/.htaccess /var/www/html/
COPY --from=builder ./build/ /var/www/html/
RUN service apache2 restart
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]