# XZSO Landing Page Dockerfile for Render deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start command - use preview for production-like serving
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]