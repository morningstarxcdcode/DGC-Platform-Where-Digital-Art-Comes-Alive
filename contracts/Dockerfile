# DGC Platform - Contracts Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install build tools for native dependencies
RUN apk add --no-cache git python3 make g++

# Install Foundry
RUN apk add --no-cache curl bash && \
    curl -L https://foundry.paradigm.xyz | bash && \
    /root/.foundry/bin/foundryup

ENV PATH="/root/.foundry/bin:${PATH}"

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build contracts
RUN forge build

# Default command - deploy contracts
CMD ["sh", "-c", "forge script scripts/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast"]
