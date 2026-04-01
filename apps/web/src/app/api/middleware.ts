import type { User } from '@monorepo/database'
import type { Env } from 'hono'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { checkIsAdminOrSuperAdmin } from '../../libs/auth/session'

export type AppEnv = Env & {
  Variables: {
    user: User
  }
}

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const user = await checkIsAdminOrSuperAdmin()
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  c.set('user', user)
  await next()
})
