# nextjs/Dockerfile

# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .


# Set production environment
ENV NODE_ENV=production


# Build the Next.js app
RUN npm run build



# Expose Next.js default port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
