FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN npm run build \
  && npm prune --omit=dev \
  && npx --no-install prisma generate \
  && chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]
