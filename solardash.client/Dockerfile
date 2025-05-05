# --- Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app
COPY solardash.client/package*.json ./
RUN npm ci
COPY solardash.client/ ./
RUN npm run build -- --configuration=production

# --- Stage 2: Serve static files via Nginx
FROM nginx:stable-alpine
# Удаляем дефолтную статику (по желанию)
RUN rm -rf /usr/share/nginx/html/*

Сopy the browser bandel
COPY --from=build /app/dist/solardash.client/browser /usr/share/nginx/html

Copy the config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80