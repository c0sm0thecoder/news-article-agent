FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Create chunks table
RUN npm run create-chunks-table

# Expose the application port
EXPOSE 3002

# Start the application
CMD ["node", "dist/index.js"]