FROM node:20-alpine

# Install build essentials (needed for compiling sqlite3/better-sqlite3 bindings)
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (including native compilation)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose Fastify's port
EXPOSE 3000

# Start the Fastify GraphQL server
CMD [ "npm", "run", "start" ]
