# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --omit=optional && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy scripts directory (needed for create-dynamodb-tables)
COPY --from=builder /app/scripts ./scripts

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs && \
    chown -R nestjs:nodejs /app

# Generate JWT RSA key pair
RUN apk add --no-cache openssl bash
COPY scripts/create-pem-keys.sh /usr/local/bin/create-pem-keys.sh
RUN chmod +x /usr/local/bin/create-pem-keys.sh && \
    /usr/local/bin/create-pem-keys.sh && \
    chown nestjs:nodejs certs/private.pem certs/public.pem && \
    chmod 400 certs/private.pem && \
    chmod 444 certs/public.pem && \
    apk del openssl bash

USER nestjs

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]