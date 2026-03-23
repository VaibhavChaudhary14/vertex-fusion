# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --ignore-scripts && \
    npm install --prefix frontend --ignore-scripts

# Copy source
COPY . .

# Build everything
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx tsx backend/scripts/build-client.ts

# Production stage
FROM nginx:stable-alpine

COPY --from=build /app/dist/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
