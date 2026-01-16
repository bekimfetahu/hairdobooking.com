FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Install bash + git so you can exec into container comfortably
RUN apk add --no-cache bash git

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy full project
COPY . .

# Do NOT build automatically
# RUN npm run build

# Keep container alive so you can exec into it
CMD ["tail", "-f", "/dev/null"]
# Expose port 3000
EXPOSE 3000
