'use client'

import { getInputProps, getSelectProps, type SubmissionResult, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../../components/common/Button'
import { Checkbox } from '../../../../../../components/common/Checkbox'
import { FlexBox } from '../../../../../../components/common/FlexBox'
import { Input } from '../../../../../../components/common/Input'
import { InputErrorMessage } from '../../../../../../components/common/InputErrorMessage'
import { InputLabel } from '../../../../../../components/common/InputLabel'
import { Select } from '../../../../../../components/common/Select'
import { Typography } from '../../../../../../components/common/Typography'
import { zodFormErrorMap } from '../../../../../../utils/libs/zod'
import { ROLE_OPTIONS } from '../../../invitations/constants/invitation'
import styles from '../../page.module.css'
import type { UserWithTeam } from '../../types'
import { UserFormSchema } from './UserForm.types'

type UserFormProps = {
  user: UserWithTeam
  action: (state: unknown, formData: FormData) => Promise<SubmissionResult<string[]>>
  onCancel: () => void
  onSuccess: () => void
  onError?: (message: string) => void
}

export function UserForm({ user, action, onCancel, onSuccess, onError }: UserFormProps) {
  const [lastResult, formAction, isPending] = useActionState(action, {
    error: undefined,
  })

  const roleOptions = ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName ?? '',
      role: user.role,
      isActive: user.isActive ?? false,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserFormSchema, errorMap: zodFormErrorMap })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  useEffect(() => {
    if (lastResult?.status === 'success') {
      onSuccess()
    }
    if (lastResult?.status === 'error' && lastResult.error && 'message' in lastResult.error) {
      const messages = lastResult.error.message
      if (Array.isArray(messages) && messages.length > 0) {
        onError?.(messages[0])
      }
    }
  }, [lastResult, onSuccess, onError])

  return (
    <form action={formAction} onSubmit={form.onSubmit} id={form.id} className={styles.form}>
      <input type='hidden' name='id' value={user.id.toString()} />
      <FlexBox flexDirection='column' gap='1.25rem'>
        <InputLabel label='メールアドレス'>
          <Typography size='md' color='var(--color-secondary)'>
            {user.email}
          </Typography>
        </InputLabel>

        <InputLabel label='姓' required>
          <Input
            placeholder='姓を入力してください'
            {...getInputProps(fields.lastName, { type: 'text' })}
            fullWidth
            error={!!fields.lastName.errors?.[0]}
            errorMessage={
              fields.lastName.errors?.[0] && <InputErrorMessage>{fields.lastName.errors[0]}</InputErrorMessage>
            }
          />
        </InputLabel>

        <InputLabel label='名' required>
          <Input
            placeholder='名を入力してください'
            {...getInputProps(fields.firstName, { type: 'text' })}
            fullWidth
            error={!!fields.firstName.errors?.[0]}
            errorMessage={
              fields.firstName.errors?.[0] && <InputErrorMessage>{fields.firstName.errors[0]}</InputErrorMessage>
            }
          />
        </InputLabel>

        <InputLabel label='表示名'>
          <Input
            placeholder='表示名を入力してください'
            {...getInputProps(fields.displayName, { type: 'text' })}
            fullWidth
            error={!!fields.displayName.errors?.[0]}
            errorMessage={
              fields.displayName.errors?.[0] && <InputErrorMessage>{fields.displayName.errors[0]}</InputErrorMessage>
            }
          />
        </InputLabel>

        <InputLabel label='役割' required>
          <Select
            {...getSelectProps(fields.role)}
            options={roleOptions}
            placeholder='役割を選択してください'
            multiple={false}
            error={!!fields.role.errors?.[0]}
          />
          {fields.role.errors?.[0] && <InputErrorMessage>{fields.role.errors[0]}</InputErrorMessage>}
        </InputLabel>

        <Checkbox
          {...getInputProps(fields.isActive, { type: 'checkbox' })}
          label='有効'
          defaultChecked={user.isActive}
        />
      </FlexBox>

      <FlexBox justifyContent='flex-end' gap='0.75rem' className={styles.actions}>
        <Button type='button' size='lg' theme='secondary' variant='outline' onClick={onCancel}>
          キャンセル
        </Button>
        <Button type='submit' size='lg' isLoading={isPending} className={styles.submitButton}>
          保存
        </Button>
      </FlexBox>
    </form>
  )
}
