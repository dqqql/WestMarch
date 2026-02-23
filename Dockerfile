FROM node:22-alpine AS base

RUN npm config set registry https://registry.npmmirror.com

FROM base AS deps
WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts

RUN npm install --save-dev prisma@6.5.0 @prisma/client@6.5.0

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma@6.5.0 generate

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

RUN npm install prisma@6.5.0

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x ./start.sh

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data && chmod -R 755 /app/data

RUN touch /app/data/dev.db && chown nextjs:nodejs /app/data/dev.db && chmod 664 /app/data/dev.db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV DATABASE_URL=file:/app/data/dev.db

CMD ["./start.sh"]
