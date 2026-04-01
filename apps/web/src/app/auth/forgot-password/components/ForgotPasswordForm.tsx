'use client'

import { useActionState } from 'react'
import { Button } from '../../../../components/common/Button'
import { FlexBox } from '../../../../components/common/FlexBox'
import { Input } from '../../../../components/common/Input'
import { MessageBox } from '../../../../components/common/MessageBox'
import { Typography } from '../../../../components/common/Typography'
import { type SendPasswordResetEmailState, sendPasswordResetEmail } from '../actions/sendPasswordResetEmail'
import styles from '../page.module.css'

export const ForgotPasswordForm = () => {
  const [state, formAction, pending] = useActionState<SendPasswordResetEmailState | null, FormData>(
    sendPasswordResetEmail,
    null,
  )

  return (
    <form className={styles.form} action={formAction}>
      <FlexBox flexDirection='column' gap='1rem'>
        {state?.error && (
          <MessageBox theme='error' data-testid='forgot-password-error'>
            {state.error.message.map((msg) => (
              <Typography key={msg} size='sm'>
                {msg}
              </Typography>
            ))}
          </MessageBox>
        )}
        <Typography className={styles.label} data-testid='forgot-password-email-label'>
          メール
        </Typography>
        <Input
          name='email'
          type='email'
          placeholder='プレースホルダー'
          fullWidth
          className={styles.inputField}
          data-testid='forgot-password-email-input'
        />
      </FlexBox>
      <Button
        type='submit'
        size='lg'
        isFullWidth
        isLoading={pending}
        className={styles.submitButton}
        data-testid='forgot-password-submit-button'
      >
        {pending ? '送信中...' : 'パスワードをリセット'}
      </Button>
    </form>
  )
}
