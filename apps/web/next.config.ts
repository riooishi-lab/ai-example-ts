import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/': ['../../packages/database/generated/**/*', '../../packages/database/prisma/**/*'],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  serverExternalPackages: ['@prisma/adapter-pg', '@prisma/client', 'pg'],
}

export default nextConfig
