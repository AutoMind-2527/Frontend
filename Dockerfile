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

# WICHTIG: hier dist/AutoMind-Project
COPY --from=build /app/dist/AutoMind-Project /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]