# --- Base image for both dev and prod ---
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# --- Development image ---
FROM base AS dev
RUN apk add --no-cache bash git
COPY package*.json ./
RUN npm ci
CMD ["tail", "-f", "/dev/null"]

# --- Production build image ---
FROM base AS builder
WORKDIR /usr/src/app

# Copy env file for Next.js build (you add this manually in Plesk)
COPY .env.production .env.production

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy full project
COPY . .

# Build Next.js (reads .env.production here)
RUN npm run build

# --- Production runtime image ---
FROM base AS prod
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy build output and required files
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
