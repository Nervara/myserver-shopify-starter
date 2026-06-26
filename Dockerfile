# Deploy-ready image for myserver (build pack: Dockerfile) or any Docker host.
# Multi-stage: install deps + build, then a slim runtime that runs Prisma
# migrations against the Postgres DATABASE_URL before serving.
FROM node:20-alpine AS build
WORKDIR /app

# Install all deps (incl. dev) for the build.
COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Drop dev dependencies for the runtime image.
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# `npm run setup` runs `prisma generate && prisma migrate deploy` so the
# Session table exists on first boot; then `remix-serve` starts the app.
CMD ["npm", "run", "docker-start"]
