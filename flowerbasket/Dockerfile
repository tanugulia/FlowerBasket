# Use an official Node runtime as a parent image
FROM node:12.17.0

# Set the working directory to /app
WORKDIR '/app'

# Copy package.json to the working directory
COPY package.json .

# Install any needed packages specified in package.json
RUN npm install

# Copying the rest of the code to the working directory
COPY . .

# Make port 1337 available to the world outside this container
EXPOSE 1337

# Run index.js when the container launches
CMD ["node", "app.js"]