'use client'

import type { Invitation } from '@monorepo/database'
import { Modal } from '../../../../../components/common/Modal'
import { updateInvitation } from '../actions/updateInvitation'
import { InvitationForm } from './InvitationForm/InvitationForm'

type Props = {
  invitation: Invitation
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditInvitationModal({ invitation, open, onClose, onSuccess }: Props) {
  return (
    <Modal open={open} onOpen={() => {}} onClose={onClose} title='招待を編集' width='medium' padding='xl'>
      <InvitationForm invitation={invitation} action={updateInvitation} onSuccess={onSuccess} onClose={onClose} />
    </Modal>
  )
}
