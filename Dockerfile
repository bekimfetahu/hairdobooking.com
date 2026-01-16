# -------------------------
# Base image (local dev)
# -------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

RUN apk add --no-cache bash git

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["tail", "-f", "/dev/null"]


# -------------------------
# Production image
# -------------------------
FROM base AS production

RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
