import { UserRole } from '@monorepo/database'

export const ROLE_OPTIONS = [
  { value: UserRole.SYSTEM_ADMIN, label: 'システム管理者' },
  { value: UserRole.MANAGER, label: '管理者' },
  { value: UserRole.MAINTENANCE, label: '保全担当' },
  { value: UserRole.FIELD_WORKER, label: '現場作業員' },
] as const

export const RoleValues = [
  UserRole.SYSTEM_ADMIN,
  UserRole.MANAGER,
  UserRole.MAINTENANCE,
  UserRole.FIELD_WORKER,
] as const

export const RoleLabels = {
  [UserRole.SYSTEM_ADMIN]: 'システム管理者',
  [UserRole.MANAGER]: '管理者',
  [UserRole.MAINTENANCE]: '保全担当',
  [UserRole.FIELD_WORKER]: '現場作業員',
} as const satisfies Record<UserRole, string>

export const INVITATION_EXPIRES_DAYS = 3
