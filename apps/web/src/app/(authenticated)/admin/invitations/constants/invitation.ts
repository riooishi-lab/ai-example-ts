import { UserRole } from '@monorepo/database'

export const ROLE_OPTIONS = [
  { value: UserRole.SUPER_ADMIN, label: 'スーパー管理者' },
  { value: UserRole.ADMIN, label: '管理者' },
  { value: UserRole.MANAGER, label: 'マネージャー' },
  { value: UserRole.SALES_REP, label: '営業担当' },
  { value: UserRole.VIEWER, label: '閲覧者' },
] as const

export const RoleValues = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.SALES_REP,
  UserRole.VIEWER,
] as const

export const RoleLabels = {
  [UserRole.SUPER_ADMIN]: 'スーパー管理者',
  [UserRole.ADMIN]: '管理者',
  [UserRole.MANAGER]: 'マネージャー',
  [UserRole.SALES_REP]: '営業担当',
  [UserRole.VIEWER]: '閲覧者',
} as const satisfies Record<UserRole, string>

export const INVITATION_EXPIRES_DAYS = 3
