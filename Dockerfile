FROM oven/bun:1.1.4-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile --production

COPY . .

RUN bun run build

RUN bun prune --production

FROM oven/bun:1.1.4-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000

ENV NODE_ENV=production
ENV DEV_HOST=${DEV_HOST}
ENV VITE_API_URL=${API_URL}
ENV WEB_URL=${WEB_URL}

CMD ["bun", "run", "build"]
