'use client'

import { getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import Link from 'next/link'
import { useActionState } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Input } from '../../../../../components/common/Input'
import { InputErrorMessage } from '../../../../../components/common/InputErrorMessage'
import { InputLabel } from '../../../../../components/common/InputLabel'
import { Typography } from '../../../../../components/common/Typography'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { zodFormErrorMap } from '../../../../../utils/libs/zod'
import type { SignInState } from '../../actions/signIn'
import { signIn } from '../../actions/signIn'
import styles from '../../page.module.css'
import { SignInFormSchema } from './SignInForm.types'

export function SignInForm() {
  const [lastResult, formAction, isPending] = useActionState<SignInState, FormData>(signIn, {})

  const [form, fields] = useForm({
    defaultValue: {
      email: '',
      password: '',
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignInFormSchema, errorMap: zodFormErrorMap })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <form action={formAction} id={form.id} onSubmit={form.onSubmit}>
      <FlexBox flexDirection='column' gap='1rem'>
        <FlexBox flexDirection='column' gap='0.75rem'>
          <InputLabel label='メール' required data-testid='signin-email-label'>
            <Input
              {...getInputProps(fields.email, { type: 'email' })}
              key={fields.email.key}
              placeholder='プレースホルダー'
              fullWidth
              error={!!fields.email.errors?.[0]}
              errorMessage={
                fields.email.errors?.[0] && (
                  <InputErrorMessage data-testid='signin-email-error'>{fields.email.errors[0]}</InputErrorMessage>
                )
              }
              data-testid='signin-email-input'
              className={styles.inputField}
            />
          </InputLabel>

          <InputLabel label='パスワード' required data-testid='signin-password-label'>
            <Input
              {...getInputProps(fields.password, { type: 'password' })}
              key={fields.password.key}
              placeholder='• • • • • • • •'
              fullWidth
              error={!!fields.password.errors?.[0]}
              errorMessage={
                fields.password.errors?.[0] && (
                  <InputErrorMessage data-testid='signin-password-error'>{fields.password.errors[0]}</InputErrorMessage>
                )
              }
              data-testid='signin-password-input'
              className={styles.inputField}
            />
          </InputLabel>
        </FlexBox>
      </FlexBox>
      <FlexBox justifyContent='flex-end'>
        <Link
          href={PAGE_PATH.FORGOT_PASSWORD}
          className={styles.forgotPasswordLink}
          data-testid='signin-forgot-password-link'
        >
          パスワードを忘れた
        </Link>
      </FlexBox>

      {lastResult?.error?.message?.[0] && (
        <Typography size='sm' color='#ef4444' className={styles.serverError} data-testid='signin-server-error'>
          {lastResult.error.message[0]}
        </Typography>
      )}

      <Button
        type='submit'
        size='lg'
        isFullWidth
        isLoading={isPending}
        className={styles.submitButton}
        data-testid='signin-submit-button'
      >
        {isPending ? 'サインイン中...' : 'サインイン'}
      </Button>
    </form>
  )
}
