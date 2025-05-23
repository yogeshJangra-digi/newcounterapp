FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PORT=3001
ENV NODE_ENV=development

# Expose the port
EXPOSE 3001

# Use nodemon for development to enable hot reloading
CMD ["npx", "nodemon", "src/index.js"]