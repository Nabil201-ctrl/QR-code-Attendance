# Stage 1: Builder
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built app from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose port and start app
EXPOSE 4000
CMD [ "node", "dist/main.js" ]
