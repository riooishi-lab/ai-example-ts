import type { Prisma } from '@monorepo/database'
import { prisma as basePrisma } from '@monorepo/database/client'

export type PaginationResult<T> = {
  items: T[]
  total: number
  totalPages: number
  page: number
  pageSize: number
}

/**
 * Extended Prisma client with a custom .paginate() method for all models.
 * This patterns is used in the 'accepting-org' project to unify pagination logic.
 */
export const prisma = basePrisma.$extends({
  model: {
    $allModels: {
      async paginate<T, A>(
        this: T,
        args: Prisma.Exact<A, Prisma.Args<T, 'findMany'>> & {
          page?: number
          pageSize?: number
        },
      ) {
        const page = Math.max(1, args.page ?? 1)
        const pageSize = Math.max(1, args.pageSize ?? 10)

        // biome-ignore lint/suspicious/noExplicitAny: prisma extensions $allModels require any for dynamic access
        const { page: _p, pageSize: _ps, ...findManyArgs } = args as any

        const [items, total] = await Promise.all([
          // biome-ignore lint/suspicious/noExplicitAny: prisma extensions $allModels require any for dynamic access
          (this as any).findMany({
            ...findManyArgs,
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          // biome-ignore lint/suspicious/noExplicitAny: prisma extensions $allModels require any for dynamic access
          (this as any).count({ where: (args as any).where }),
        ])

        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      },
    },
  },
})

export type ExtendedPrismaClient = typeof prisma
