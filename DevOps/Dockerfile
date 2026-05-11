# --- CAREERORBIT MULTI-STAGE PRODUCTION DOCKERFILE ---
# Assigned to: Deployment & DevOps Team

# Stage 1: Build Environment
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests from the Management folder
COPY Management/package.json Management/package-lock.json ./
RUN npm ci

# Copy core source folders
COPY web-app ./web-app
COPY Services ./Services
COPY Models ./Models
COPY Storage ./Storage
COPY Management ./Management

# Set build-time environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run build process (Targeting the web-app entry point)
RUN npm run build --prefix web-app

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy necessary assets from builder
COPY --from=builder /app/web-app/public ./public
COPY --from=builder /app/web-app/.next/standalone ./
COPY --from=builder /app/web-app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
