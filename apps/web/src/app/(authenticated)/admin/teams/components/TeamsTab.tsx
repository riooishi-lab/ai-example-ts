'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Toast, useToast } from '../../../../../components/common/Toast'
import { createTeam } from '../actions/createTeam'
import { updateTeam } from '../actions/updateTeam'
import type { TeamUser, TeamWithMembers } from '../types'
import { DeleteTeamModal } from './DeleteTeamModal'
import { CreatedAtCell, createActionCell, MemberCountCell, TeamNameCell } from './TeamCells'
import { TeamForm } from './TeamForm/TeamForm'
import { TeamMembersModal } from './TeamMembersModal'
import { TeamSearchFilter } from './TeamSearchFilter'

type Props = {
  teams: TeamWithMembers[]
  allUsers: TeamUser[]
}

export function TeamsTab({ teams, allUsers }: Props) {
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null)
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null)
  const [managingTeamId, setManagingTeamId] = useState<number | null>(null)
  const { showToast, toastProps } = useToast()

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return teams
    return teams.filter((t) => t.name.toLowerCase().includes(q) || t.publicId.toLowerCase().includes(q))
  }, [teams, search])

  const editingTeam = useMemo(() => teams.find((t) => t.id === editingTeamId) ?? null, [teams, editingTeamId])
  const deletingTeam = useMemo(() => teams.find((t) => t.id === deletingTeamId) ?? null, [teams, deletingTeamId])
  const managingTeam = useMemo(() => teams.find((t) => t.id === managingTeamId) ?? null, [teams, managingTeamId])

  const handleEdit = useCallback((team: TeamWithMembers) => setEditingTeamId(team.id), [])
  const handleDelete = useCallback((team: TeamWithMembers) => setDeletingTeamId(team.id), [])
  const handleManageMembers = useCallback((team: TeamWithMembers) => setManagingTeamId(team.id), [])

  const handleMembersSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const handleMembersError = useCallback((message: string) => showToast(message, 'error'), [showToast])
  const handleMembersClose = useCallback(() => setManagingTeamId(null), [])

  const columns: CellProps<TeamWithMembers>[] = useMemo(
    () => [
      { label: 'チーム名', Component: TeamNameCell },
      { label: 'メンバー数', Component: MemberCountCell },
      { label: '作成日', Component: CreatedAtCell },
      { label: 'アクション', Component: createActionCell(handleEdit, handleDelete, handleManageMembers) },
    ],
    [handleEdit, handleDelete, handleManageMembers],
  )

  return (
    <FlexBox flexDirection='column' gap='1.5rem'>
      <FlexBox justifyContent='flex-end'>
        <Button size='lg' onClick={() => setIsCreating(true)} data-testid='teams-create-button'>
          チームを作成
        </Button>
      </FlexBox>

      <TeamSearchFilter search={search} onSearchChange={setSearch} />

      <Table rows={filteredTeams} uniqueKey='id' noRowsMessage='チームはありません' columns={columns} />

      <Modal open={isCreating} onClose={() => setIsCreating(false)} title='チームを作成' width='medium' padding='xl'>
        <TeamForm
          action={createTeam}
          onCancel={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false)
            showToast('チームを作成しました', 'success')
          }}
          onError={(message) => showToast(message, 'error')}
        />
      </Modal>

      <Modal
        open={!!editingTeam}
        onClose={() => setEditingTeamId(null)}
        title='チームを編集'
        width='medium'
        padding='xl'
      >
        {editingTeam && (
          <TeamForm
            teamId={editingTeam.id}
            defaultName={editingTeam.name}
            action={updateTeam}
            onCancel={() => setEditingTeamId(null)}
            onSuccess={() => {
              setEditingTeamId(null)
              showToast('チームを更新しました', 'success')
            }}
            onError={(message) => showToast(message, 'error')}
          />
        )}
      </Modal>

      {deletingTeam && (
        <DeleteTeamModal
          team={deletingTeam}
          open={!!deletingTeam}
          onClose={() => setDeletingTeamId(null)}
          onSuccess={() => {
            setDeletingTeamId(null)
            showToast('チームを削除しました', 'success')
          }}
        />
      )}

      {managingTeam && (
        <TeamMembersModal
          team={managingTeam}
          allUsers={allUsers}
          open={!!managingTeam}
          onClose={handleMembersClose}
          onSuccess={handleMembersSuccess}
          onError={handleMembersError}
        />
      )}

      <Toast {...toastProps} />
    </FlexBox>
  )
}
