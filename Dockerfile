# ===== Build-Stage (Angular) =====
FROM node:20 AS build
WORKDIR /app

# package.json aus deinem Projekt kopieren
COPY AutoMind-Project/package*.json ./

# Dependencies installieren
RUN npm ci

# Restlichen Frontend-Code kopieren
COPY AutoMind-Project/. .

# Production-Build
RUN npm run build -- --configuration=production

# ===== Runtime-Stage (Nginx) =====
FROM nginx:stable-alpine

# WICHTIG: Angular 20 outputs to dist/AutoMind-Project/browser
COPY --from=build /app/dist/AutoMind-Project/browser /usr/share/nginx/html

# Configure nginx to serve SPA correctly
RUN echo "server { listen 80; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]