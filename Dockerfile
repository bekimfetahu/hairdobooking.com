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

# Copy env file for Next.js build (you will add this manually in Plesk before building the image
COPY .env.production .env.production

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production runtime image ---
FROM base AS prod
ENV NODE_ENV=production

COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package*.json ./

RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
