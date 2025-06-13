# Build stage
FROM node:18 AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only the built files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]