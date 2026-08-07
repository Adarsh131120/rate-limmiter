FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

# No secrets baked in — REDIS_URL etc. come from the environment at
# `docker run` / docker-compose / platform secrets time. See
# docs/ACCOUNTS_AND_CREDENTIALS.md.
CMD ["node", "src/server.js"]
