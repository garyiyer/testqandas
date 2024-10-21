# Use the official Node.js image as a parent image
FROM node:20

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install Python dependencies
RUN pip3 install cursor==0.41

# Command to start the application
CMD ["npm", "start"]
