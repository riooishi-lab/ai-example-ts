'use client'

import { useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { Button } from '../../../../../components/common/Button'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import { createInvitation } from '../actions/createInvitation'
import styles from '../page.module.css'
import { InvitationForm } from './InvitationForm/InvitationForm'

export function CreateInvitationModal() {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => setIsOpen(false)

  return (
    <>
      <Button className={styles.submitButton} onClick={() => setIsOpen(true)}>
        <GoPlus size={24} />
        <Typography size='md' weight='bold'>
          新規招待
        </Typography>
      </Button>
      <Modal
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={handleClose}
        title='新規招待'
        width='medium'
        padding='xl'
      >
        <InvitationForm action={createInvitation} onSuccess={handleClose} onClose={handleClose} />
      </Modal>
    </>
  )
}
