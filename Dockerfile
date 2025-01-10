# Node.js base image
FROM node:16

# Çalışma dizini oluştur
WORKDIR /app

# Package.json ve package-lock.json kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm dosyaları kopyala
COPY . .

# Build
RUN npm run build

# Port
EXPOSE 3000

# Başlat
CMD ["npm", "start"] 