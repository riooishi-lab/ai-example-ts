import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../middleware'
import { authMiddleware } from '../middleware'

const sampleRouter = new Hono<AppEnv>()

let sampleData = [
  { id: 1, title: 'Sample Item 1', description: 'This is a sample item', createdAt: new Date().toISOString() },
  { id: 2, title: 'Sample Item 2', description: 'Another sample item', createdAt: new Date().toISOString() },
]

const createSampleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

sampleRouter.get('/', (c) => {
  return c.json({
    success: true,
    data: sampleData,
    total: sampleData.length,
  })
})

sampleRouter.get('/:id', (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  const item = sampleData.find((item) => item.id === id)

  if (!item) {
    return c.json({ error: 'Sample not found' }, 404)
  }

  return c.json({
    success: true,
    data: item,
  })
})

sampleRouter.post('/', authMiddleware, sValidator('json', createSampleSchema), (c) => {
  const body = c.req.valid('json')

  const newItem = {
    id: sampleData.length + 1,
    title: body.title,
    description: body.description || '',
    createdAt: new Date().toISOString(),
  }

  sampleData = [...sampleData, newItem]

  return c.json(
    {
      success: true,
      data: newItem,
      message: 'Sample created successfully',
    },
    201,
  )
})

sampleRouter.put('/:id', authMiddleware, sValidator('json', createSampleSchema), (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  const body = c.req.valid('json')
  const index = sampleData.findIndex((item) => item.id === id)

  if (index === -1) {
    return c.json({ error: 'Sample not found' }, 404)
  }

  sampleData = sampleData.map((item) =>
    item.id === id ? { ...item, title: body.title, description: body.description || item.description } : item,
  )

  const updatedItem = sampleData.find((item) => item.id === id)

  return c.json({
    success: true,
    data: updatedItem,
    message: 'Sample updated successfully',
  })
})

sampleRouter.delete('/:id', authMiddleware, (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  const exists = sampleData.some((item) => item.id === id)

  if (!exists) {
    return c.json({ error: 'Sample not found' }, 404)
  }

  sampleData = sampleData.filter((item) => item.id !== id)

  return c.json({
    success: true,
    message: 'Sample deleted successfully',
  })
})

export { sampleRouter as sample }
