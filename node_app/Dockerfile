FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Use npm ci for clean install (requires package-lock.json)
RUN npm ci --legacy-peer-deps --only=production

# Copy the rest of the application code
COPY . .

# Expose the port (based on docker-compose.yml)
EXPOSE 8000

# Command to run the app (assuming package.json has a start script; adjust if needed to ["node", "index.js"])
CMD ["node", "index.js"]

