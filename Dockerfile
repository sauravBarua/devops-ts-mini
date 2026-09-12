# syntax=docker/dockerfile:1

# ---- Stage 1: deps ----
# Install ALL dependencies (including dev) once, so both the build stage
# and any future test-in-container stage can reuse this layer via cache.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: build ----
# Compile TypeScript to JavaScript using the deps installed above.
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Stage 3: prod-deps ----
# Install ONLY production dependencies, in a clean layer, discarding
# the dev-dependency-laden node_modules from stage 1 entirely.
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 4: runtime ----
# The actual image that ships. Contains only: compiled JS, prod deps,
# and a non-root user. No TypeScript, no ESLint, no source maps'
# source files, no build tools.
FROM node:24-alpine AS runtime
WORKDIR /app

# Create a non-root user to run the app. Running as root inside a
# container is a common and avoidable security misstep: if the process
# is ever compromised (e.g. via a dependency vulnerability), root
# inside the container has far more capability than a dedicated user.
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