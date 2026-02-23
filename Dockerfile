FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions (no version upgrades)
RUN npm ci --omit=dev --ignore-scripts

# Install devDependencies needed for build
RUN npm install --save-dev prisma@6.5.0 @prisma/client@6.5.0

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client with exact version
RUN npx prisma@6.5.0 generate

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Install Prisma CLI for runtime migrations (with exact version)
RUN npm install prisma@6.5.0

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy startup script
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x ./start.sh

# Create data directory for SQLite with correct permissions
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data && chmod -R 755 /app/data

# Create database file with correct permissions before switching user
RUN touch /app/data/dev.db && chown nextjs:nodejs /app/data/dev.db && chmod 664 /app/data/dev.db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV DATABASE_URL=file:/app/data/dev.db

CMD ["./start.sh"]
