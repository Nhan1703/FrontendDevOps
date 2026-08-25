# Stage 1: Build React App with Vite
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve static files with lightweight Nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Xóa file mặc định của Nginx và copy bản build từ Stage 1
RUN rm -rf ./*
COPY --from=builder /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
