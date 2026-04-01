import { randomUUID } from 'node:crypto'
import { e2eEnv } from '../env'

let poolInstance: import('pg').Pool | undefined

async function getPool(): Promise<import('pg').Pool> {
  if (poolInstance) return poolInstance
  const { Pool } = await import('pg')
  poolInstance = new Pool({ connectionString: e2eEnv.DATABASE_URL, max: 5 })
  return poolInstance
}

async function runQuery<T>(fn: (pool: import('pg').Pool) => Promise<T>): Promise<T> {
  const pool = await getPool()
  return fn(pool)
}

type CreateInvitationParams = {
  email: string
  token: string
  invitedById: number
  expired?: boolean
}

export async function createTestInvitation({ email, token, invitedById, expired }: CreateInvitationParams) {
  const interval = expired ? "NOW() - INTERVAL '1 day'" : "NOW() + INTERVAL '3 days'"
  return runQuery((pool) =>
    pool.query(
      `INSERT INTO invitations (public_id, token, email, first_name, last_name, role, status, invited_by_id, expires_at, created_at, updated_at)
       VALUES ($4, $1, $2, 'E2E', 'Invitee', 'SALES_REP', 'PENDING', $3, ${interval}, NOW(), NOW())
       ON CONFLICT (token) DO NOTHING`,
      [token, email, invitedById, randomUUID()],
    ),
  )
}

export async function markInvitationAccepted(token: string) {
  return runQuery((pool) =>
    pool.query("UPDATE invitations SET status = 'ACCEPTED', accepted_at = NOW() WHERE token = $1", [token]),
  )
}

export async function upsertTestUser(email: string, authProviderId: string) {
  return runQuery((pool) =>
    pool.query(
      `INSERT INTO users (public_id, auth_provider_id, email, first_name, last_name, role, is_active, is_email_verified, created_at, updated_at)
       VALUES ($3, $1, $2, 'E2E', 'Test', 'ADMIN', true, true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET auth_provider_id = $1, deleted_at = NULL`,
      [authProviderId, email, randomUUID()],
    ),
  )
}

export async function getTestUserId(email: string): Promise<number | undefined> {
  return runQuery(async (pool) => {
    const result = await pool.query('SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL', [email])
    return result.rows[0]?.id
  })
}

export async function cleanupTestUser(email: string) {
  return runQuery((pool) =>
    pool.query('UPDATE users SET deleted_at = NOW() WHERE email = $1 AND deleted_at IS NULL', [email]),
  )
}

export async function cleanupTestInvitation(token: string) {
  return runQuery((pool) =>
    pool.query('UPDATE invitations SET deleted_at = NOW() WHERE token = $1 AND deleted_at IS NULL', [token]),
  )
}

export async function createTestTeam(name: string): Promise<number> {
  return runQuery(async (pool) => {
    const result = await pool.query(
      `INSERT INTO teams (public_id, name, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [randomUUID(), name],
    )
    return result.rows[0].id
  })
}

export async function createTestTeamMember(teamId: number, userId: number): Promise<number> {
  return runQuery(async (pool) => {
    const result = await pool.query(
      `INSERT INTO team_members (team_id, user_id, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [teamId, userId],
    )
    return result.rows[0].id
  })
}

export async function cleanupTestTeam(teamId: number) {
  return runQuery(async (pool) => {
    await pool.query('UPDATE team_members SET deleted_at = NOW() WHERE team_id = $1 AND deleted_at IS NULL', [teamId])
    await pool.query('UPDATE teams SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [teamId])
  })
}
