# DGC Platform Frontend - Production Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_CHAIN_ID
ARG VITE_DGC_TOKEN_ADDRESS
ARG VITE_PROVENANCE_ADDRESS
ARG VITE_ROYALTY_ADDRESS
ARG VITE_MARKETPLACE_ADDRESS
ARG VITE_NETWORK

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CHAIN_ID=$VITE_CHAIN_ID
ENV VITE_DGC_TOKEN_ADDRESS=$VITE_DGC_TOKEN_ADDRESS
ENV VITE_PROVENANCE_ADDRESS=$VITE_PROVENANCE_ADDRESS
ENV VITE_ROYALTY_ADDRESS=$VITE_ROYALTY_ADDRESS
ENV VITE_MARKETPLACE_ADDRESS=$VITE_MARKETPLACE_ADDRESS
ENV VITE_NETWORK=$VITE_NETWORK

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
