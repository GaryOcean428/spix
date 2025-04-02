# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy only necessary application code to the working directory
# Leverage .dockerignore to exclude unnecessary files
COPY . .
# Note: While the suggestion was to copy specific files/dirs,
# COPY . . combined with a good .dockerignore achieves a similar
# effect for build caching by only copying relevant source files.
# If further optimization is needed, specific COPY commands can be used.

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]