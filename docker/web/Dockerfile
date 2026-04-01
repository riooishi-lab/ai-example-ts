# syntax=docker.io/docker/dockerfile:1

FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY packages/database/package.json packages/database/pnpm-lock.yaml* ./packages/database/
COPY packages/database/prisma/schema.prisma ./packages/database/prisma/schema.prisma
COPY packages/database/prisma.config.ts ./packages/database/prisma.config.ts
COPY packages/database/scripts ./packages/database/scripts
COPY apps/web/package.json apps/web/pnpm-lock.yaml* ./apps/web/
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /workspace/apps/web/node_modules ./apps/web/node_modules
# Copy the entire monorepo
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
WORKDIR /workspace/packages/database
RUN corepack enable pnpm && pnpm run db:generate

WORKDIR /workspace/apps/web
RUN \
  if [ -f ../../pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /workspace

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /workspace/apps/web/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/static ./apps/web/.next/static
# Copy Prisma generated client
COPY --from=builder --chown=nextjs:nodejs /workspace/packages/database/generated ./packages/database/generated
COPY --from=builder --chown=nextjs:nodejs /workspace/packages/database/prisma ./packages/database/prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
