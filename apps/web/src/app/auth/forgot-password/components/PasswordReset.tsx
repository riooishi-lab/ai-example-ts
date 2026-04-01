'use client'

import { useActionState } from 'react'
import { Button } from '../../../../components/common/Button'
import { FlexBox } from '../../../../components/common/FlexBox'
import { Input } from '../../../../components/common/Input'
import { MessageBox } from '../../../../components/common/MessageBox'
import { Typography } from '../../../../components/common/Typography'
import { type ConfirmPasswordResetState, confirmPasswordReset } from '../actions/confirmPasswordReset'
import styles from '../page.module.css'

type PasswordResetProps = {
  oobCode: string
}

export function PasswordReset({ oobCode }: PasswordResetProps) {
  const [state, formAction, pending] = useActionState<ConfirmPasswordResetState | null, FormData>(
    confirmPasswordReset,
    null,
  )

  return (
    <form action={formAction}>
      <input type='hidden' name='oobCode' value={oobCode} />
      <FlexBox flexDirection='column' gap='1rem'>
        {state?.error && (
          <MessageBox theme='error' data-testid='password-reset-error'>
            {state.error.message.map((msg: string) => (
              <Typography key={msg} size='sm'>
                {msg}
              </Typography>
            ))}
          </MessageBox>
        )}

        <FlexBox gap='2rem' flexDirection='column'>
          <FlexBox flexDirection='column' gap='0.75rem'>
            <Typography className={styles.label} data-testid='password-reset-password-label'>
              パスワード
            </Typography>
            <Input
              name='password'
              type='password'
              minLength={8}
              placeholder='• • • • • • • •'
              fullWidth
              className={styles.inputField}
              data-testid='password-reset-password-input'
            />
          </FlexBox>
        </FlexBox>

        <Button
          type='submit'
          size='lg'
          isFullWidth
          isLoading={pending}
          className={styles.submitButton}
          data-testid='password-reset-submit-button'
        >
          {pending ? '再設定中...' : 'パスワード再設定'}
        </Button>
      </FlexBox>
    </form>
  )
}
