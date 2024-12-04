# ? -------------------------
# ? Builder: Complile TypeScript to JS
# ? -------------------------

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable
RUN pnpm i --frozen-lockfile

# copy sources
COPY src ./src
COPY tsconfig.json ./

# compile
RUN pnpm build

# ? -------------------------
# ? Deps-prod: Obtaining node_moules that contains just production dependencies
# ? -------------------------

FROM node:22-alpine AS deps-prod

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable
RUN pnpm i --frozen-lockfile --prod

# ? -------------------------
# ? Runner: Production to run
# ? -------------------------

FROM node:22-alpine AS runner

RUN apk add --no-cache docker rclone

WORKDIR /app

LABEL name="honami-backup"

ENV NODE_ENV=production

# copy all files from layers above
COPY package.json ./
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
