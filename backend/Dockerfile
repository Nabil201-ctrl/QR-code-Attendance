# ===============================
# Stage 1: Builder
# ===============================
FROM node:22-alpine AS builder

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from backend folder
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY backend ./

# Build the NestJS project
RUN npm run build

# ===============================
# Stage 2: Production
# ===============================
FROM node:22-alpine

# Set working directory for production
WORKDIR /usr/src/app

# Copy package.json for production install
COPY backend/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port your app listens on
EXPOSE 4000

# Start the app
CMD ["node", "dist/main.js"]
