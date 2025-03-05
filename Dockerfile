FROM node:20-alpine AS base

WORKDIR /app

# DEPENDENCY STAGE
FROM base AS deps
COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma/
COPY tsconfig.build.json ./
RUN yarn install --frozen-lockfile --production=false

# Builder Stage
FROM deps AS builder
COPY . .
ARG APP_NAME=hefamaa-api
RUN yarn build

# DEVELOPMENT STAGE
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/yarn.lock ./
COPY --from=deps /app/package.json ./
COPY --from=deps /app/prisma ./prisma/

# Production stage
# FROM iswprodacr.azurecr.io/node:20-alpine AS production
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies and built application
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist/ ./
COPY --from=development /app/prisma ./prisma/

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Expose the port your app runs on
EXPOSE 8000

# Start the application
CMD ["node", "main.js"]

