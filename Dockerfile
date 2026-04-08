FROM oven/bun:1.1.4-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY . .

RUN mkdir -p build

RUN bun run build

RUN bun prune --production

FROM oven/bun:1.1.4-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

ENV NODE_ENV=production
ENV PUBLIC_API_URL=${PUBLIC_API_URL}
ENV PUBLIC_WEB_URL=${PUBLIC_WEB_URL}

CMD ["bun", "run", "start"]
