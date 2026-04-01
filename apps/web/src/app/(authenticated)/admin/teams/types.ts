import type { Team, TeamMember, User } from '@monorepo/database'

export type TeamUser = Pick<User, 'id' | 'publicId' | 'firstName' | 'lastName' | 'email'>

export type TeamMemberWithUser = TeamMember & { user: TeamUser }

export type TeamWithMembers = Team & {
  _count: { teamMembers: number }
  teamMembers: TeamMemberWithUser[]
}
