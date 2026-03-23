# Build stage for Frontend and Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ignoring scripts to avoid cross-platform issues)
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npx tsx backend/scripts/build-server.ts

# Production stage
FROM node:20-alpine

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
