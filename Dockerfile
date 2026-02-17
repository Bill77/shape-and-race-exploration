# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/shape-n-race/package.json ./apps/shape-n-race/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js app with standalone output
RUN npx nx build shape-n-race --configuration=production

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output and public files
COPY --from=builder --chown=nextjs:nodejs /app/apps/shape-n-race/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/shape-n-race/.next/static ./apps/shape-n-race/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/shape-n-race/public ./apps/shape-n-race/public

# Set working directory to the app
WORKDIR /app/apps/shape-n-race

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the standalone server
CMD ["node", "server.js"]
