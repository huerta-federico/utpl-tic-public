# Utilizamos la imagen oficial de Node.js 20 Alpine (pequeña y segura)
FROM node:22-alpine

# Crea y establece el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --only=production

# Copia el código fuente de la aplicación al contenedor
COPY . .

# Exponemos el puerto 8080 para la API
EXPOSE 8080

# Define variable para el puerto
ENV PORT=8080

# Inicia el servidor
CMD ["node", "index.js"]
