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

RUN npm install prisma@6.5.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

RUN mkdir -p /app/data

EXPOSE 3000

ENV PORT=3000
ENV DATABASE_URL=file:/app/data/dev.db

CMD ["./start.sh"]
