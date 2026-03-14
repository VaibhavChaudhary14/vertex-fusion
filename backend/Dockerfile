# Build stage for Frontend and Backend
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
# This script builds both frontend and backend into the /dist folder
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Expose the backend port
EXPOSE 5050

# Start the server
CMD ["node", "dist/index.cjs"]
