FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client (no DB connection needed at generate time)
COPY prisma ./prisma
RUN npx prisma generate

# Pass dummy DATABASE_URL for Next.js build (no actual DB connection made at build time)
ARG DATABASE_URL="postgresql://ci:ci@localhost:5432/ci"
ARG AUTH_SECRET="build-time-dummy-secret"
ENV DATABASE_URL=$DATABASE_URL
ENV AUTH_SECRET=$AUTH_SECRET

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
