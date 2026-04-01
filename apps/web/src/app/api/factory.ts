import { sValidator } from '@hono/standard-validator'
import { createFactory } from 'hono/factory'
import { z } from 'zod'
import { type AppEnv, authMiddleware } from './middleware'

const factory = createFactory<AppEnv>()

export const basePaginateSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

const deleteSchema = z.object({
  id: z.number().int().positive(),
})

type SoftDeleteConfig = {
  findFirst: (id: number) => Promise<{ id: number } | null>
  softDelete: (id: number) => Promise<unknown>
}

export function createRemoveHandler({ findFirst, softDelete }: SoftDeleteConfig) {
  return factory.createHandlers(authMiddleware, sValidator('json', deleteSchema), async (c) => {
    const { id } = c.req.valid('json')

    const existing = await findFirst(id)
    if (!existing) {
      return c.json({ error: 'Not found' }, 404)
    }

    await softDelete(id)

    return c.json({ success: true })
  })
}
