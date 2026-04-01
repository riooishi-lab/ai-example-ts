'use client'

import { useState } from 'react'
import { FiUser } from 'react-icons/fi'
import { GoPlus } from 'react-icons/go'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { Toast, useToast } from '../../../../../components/common/Toast'
import { Typography } from '../../../../../components/common/Typography'
import { createInvitation } from '../../invitations/actions/createInvitation'
import { InvitationForm } from '../../invitations/components/InvitationForm/InvitationForm'
import styles from '../page.module.css'

export function CreateUserButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { showToast, toastProps } = useToast()

  return (
    <FlexBox flexDirection='row' gap='1rem'>
      <Button size='lg' className={styles.submitButton} onClick={() => setIsOpen(true)}>
        <GoPlus size={24} />
        <Typography size='md' weight='bold'>
          新規ユーザー作成
        </Typography>
      </Button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={
          <FlexBox alignItems='center' gap='0.5rem'>
            <div className={styles.modalIcon}>
              <FiUser size={24} />
            </div>
            <Typography size='lg' weight='bold' style={{ color: '#374151' }}>
              新規ユーザー作成
            </Typography>
          </FlexBox>
        }
        width='medium'
        padding='xl'
      >
        <InvitationForm
          action={createInvitation}
          onSuccess={() => {
            setIsOpen(false)
            showToast('ユーザーを作成しました')
          }}
          onClose={() => setIsOpen(false)}
        />
      </Modal>
      <Toast {...toastProps} />
    </FlexBox>
  )
}
