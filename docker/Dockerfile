# Stage 1: Build the React application
FROM node:16 as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Set environment variables before building
ARG API_URL
ARG INVENTORY_URL
ARG CVSS_CALCULATOR_URL

ENV VITE_API_URL=$API_URL
ENV VITE_INVENTORY_URL=$INVENTORY_URL
ENV VITE_CVSS_CALCULATOR_URL=$CVSS_CALCULATOR_URL

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build your app
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:1.25.2-alpine

# Copy your Nginx configuration from the local directory to the container
COPY ./docker/nginx /etc/nginx

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist /usr/share/nginx/html

# Create a new user "appuser" and use /app as the home directory
RUN addgroup -S guardian && adduser -S guardian -G guardian && \
    chown -R guardian:guardian /var/cache/nginx /var/run /run /var/log/nginx

# Switch to non-root user
USER guardian

# Start Nginx and keep it running in the foreground
CMD ["nginx", "-g", "daemon off;"]