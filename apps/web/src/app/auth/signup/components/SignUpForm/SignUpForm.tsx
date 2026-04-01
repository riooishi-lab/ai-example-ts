'use client'

import { getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useActionState } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Input } from '../../../../../components/common/Input'
import { InputErrorMessage } from '../../../../../components/common/InputErrorMessage'
import { Typography } from '../../../../../components/common/Typography'
import { zodFormErrorMap } from '../../../../../utils/libs/zod'
import { signUp } from '../../actions/signUp'
import styles from '../../page.module.css'
import { SignUpFormSchema } from './SignUpForm.types'

type Props = {
  token: string
  email: string
}

export function SignUpForm({ token, email }: Props) {
  const [lastResult, formAction, isPending] = useActionState(signUp, {
    error: {
      message: [],
    },
  })

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      email,
      token,
      password: '',
      confirmPassword: '',
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignUpFormSchema, errorMap: zodFormErrorMap })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <form action={formAction} id={form.id} onSubmit={form.onSubmit}>
      <input type='hidden' name='token' value={token} />
      <input type='hidden' name='email' value={email} />

      <FlexBox flexDirection='column' gap='1rem'>
        <FlexBox flexDirection='column' gap='0.75rem'>
          <Typography className={styles.label}>メールアドレス</Typography>
          <Input
            {...getInputProps(fields.email, { type: 'email' })}
            key={fields.email.key}
            placeholder='email@example.com'
            disabled
            fullWidth
            error={!!fields.email.errors?.[0]}
            errorMessage={fields.email.errors?.[0] && <InputErrorMessage>{fields.email.errors[0]}</InputErrorMessage>}
            className={styles.inputField}
            data-testid='signup-email-input'
          />

          <Typography className={styles.label}>パスワード</Typography>
          <Input
            {...getInputProps(fields.password, { type: 'password' })}
            key={fields.password.key}
            type='password'
            minLength={6}
            maxLength={16}
            placeholder='• • • • • • • •'
            fullWidth
            error={!!fields.password.errors?.[0]}
            errorMessage={
              fields.password.errors?.[0] && <InputErrorMessage>{fields.password.errors[0]}</InputErrorMessage>
            }
            className={styles.inputField}
            data-testid='signup-password-input'
          />
          <Typography size='sm' style={{ marginTop: '-0.25rem' }}>
            6文字以上16文字以内で入力してください。
          </Typography>

          <Typography className={styles.label}>パスワード（確認）</Typography>
          <Input
            {...getInputProps(fields.confirmPassword, { type: 'password' })}
            key={fields.confirmPassword.key}
            placeholder='• • • • • • • •'
            fullWidth
            error={!!fields.confirmPassword.errors?.[0]}
            errorMessage={
              fields.confirmPassword.errors?.[0] && (
                <InputErrorMessage>{fields.confirmPassword.errors[0]}</InputErrorMessage>
              )
            }
            className={styles.inputField}
            data-testid='signup-confirm-password-input'
          />
        </FlexBox>
      </FlexBox>

      <Button
        type='submit'
        size='lg'
        isFullWidth
        isLoading={isPending}
        className={styles.submitButton}
        data-testid='signup-submit-button'
      >
        {isPending ? '登録中...' : 'アカウント登録'}
      </Button>
    </form>
  )
}
