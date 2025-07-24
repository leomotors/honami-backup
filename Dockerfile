# ? -------------------------
# ? Builder: Complile TypeScript to JS
# ? -------------------------

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable
RUN pnpm i --frozen-lockfile

# Copy Sources
COPY src ./src
COPY tsconfig.json ./
COPY tsup.config.ts ./

# Compile & Bundle
RUN pnpm build

# ? -------------------------
# ? Runner: Production to run
# ? -------------------------

FROM node:22-alpine AS runner

RUN apk add --no-cache docker rclone

WORKDIR /app

LABEL name="honami-backup"

ENV NODE_ENV=production

# copy all files from layers above
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
