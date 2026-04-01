import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { handle } from 'hono/vercel'
import { ZodError } from 'zod'
import type { AppEnv } from '../middleware'
import { sample } from '../routers/sample'

export const runtime = 'nodejs'

const app = new Hono<AppEnv>().basePath('/api')

app.use('*', logger())
app.use('*', cors())
app.use('*', secureHeaders())

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  if (err instanceof ZodError) {
    return c.json({ error: err.flatten().fieldErrors }, 400)
  }
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

const routes = app.route('/sample', sample)

export type AppType = typeof routes

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
