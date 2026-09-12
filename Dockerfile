# syntax=docker/dockerfile:1

# ---- Stage 1: deps ----
FROM node:24-alpine AS deps
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: build ----
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Stage 3: prod-deps ----
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ---- Stage 4: runtime ----
FROM node:24-alpine AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER appuser

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]