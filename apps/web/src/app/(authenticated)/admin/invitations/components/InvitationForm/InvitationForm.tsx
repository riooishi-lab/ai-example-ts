'use client'

import { getInputProps, getSelectProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { UserRole } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../../components/common/Button'
import { Checkbox } from '../../../../../../components/common/Checkbox'
import { FlexBox } from '../../../../../../components/common/FlexBox'
import { Input } from '../../../../../../components/common/Input'
import { InputErrorMessage } from '../../../../../../components/common/InputErrorMessage'
import { InputLabel } from '../../../../../../components/common/InputLabel'
import { MessageBox } from '../../../../../../components/common/MessageBox'
import { Select } from '../../../../../../components/common/Select'
import { Typography } from '../../../../../../components/common/Typography'
import { zodFormErrorMap } from '../../../../../../utils/libs/zod'
import { ROLE_OPTIONS } from '../../constants'
import styles from '../../page.module.css'
import { type InvitationFormProps, InvitationFormSchema } from './InvitationForm.types'

const getButtonText = (isEditMode: boolean, pending: boolean) => {
  if (isEditMode) {
    return pending ? '更新中...' : '更新'
  }
  return pending ? '作成中...' : '作成'
}

export function InvitationForm({ invitation, action, onSuccess, onClose }: InvitationFormProps) {
  const isEditMode = !!invitation

  const [lastResult, formAction, isPending] = useActionState(action, {
    error: {
      message: [],
    },
  })

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      id: invitation?.id,
      email: invitation?.email ?? '',
      lastName: invitation?.lastName ?? '',
      firstName: invitation?.firstName ?? '',
      displayName: invitation?.displayName ?? '',
      role: invitation?.role ?? UserRole.SALES_REP,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: InvitationFormSchema, errorMap: zodFormErrorMap })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  useEffect(() => {
    if (lastResult?.status === 'success') {
      onSuccess?.()
    }
  }, [lastResult, onSuccess])

  return (
    <form action={formAction} id={form.id} onSubmit={form.onSubmit}>
      {invitation && <input type='hidden' name='id' value={invitation.id} />}
      <FlexBox flexDirection='column' gap='1.5rem'>
        <FlexBox flexDirection='column' gap='1rem'>
          {lastResult?.status === 'error' && !isPending && lastResult.error?.message?.[0] && (
            <MessageBox theme='error'>
              <Typography size='sm'>{lastResult.error.message[0]}</Typography>
            </MessageBox>
          )}

          <InputLabel label='メールアドレス' required={!isEditMode}>
            {isEditMode && <input type='hidden' name='email' value={invitation?.email} />}
            <Input
              {...getInputProps(fields.email, { type: 'email' })}
              key={fields.email.key}
              placeholder='例: user@example.com'
              disabled={isEditMode}
              fullWidth
              error={!!fields.email.errors?.[0]}
              errorMessage={fields.email.errors?.[0] && <InputErrorMessage>{fields.email.errors[0]}</InputErrorMessage>}
              className={styles.inputField}
            />
          </InputLabel>

          <FlexBox gap='1rem' style={{ flexWrap: 'wrap' }}>
            <FlexBox flexDirection='column' gap='0.25rem' style={{ flex: '1 1 200px', minWidth: 0 }}>
              <InputLabel label='姓' required>
                <Input
                  {...getInputProps(fields.lastName, { type: 'text' })}
                  key={fields.lastName.key}
                  placeholder='例: 山田'
                  fullWidth
                  error={!!fields.lastName.errors?.[0]}
                  errorMessage={
                    fields.lastName.errors?.[0] && <InputErrorMessage>{fields.lastName.errors[0]}</InputErrorMessage>
                  }
                  className={styles.inputField}
                />
              </InputLabel>
            </FlexBox>
            <FlexBox flexDirection='column' gap='0.25rem' style={{ flex: '1 1 200px', minWidth: 0 }}>
              <InputLabel label='名' required>
                <Input
                  {...getInputProps(fields.firstName, { type: 'text' })}
                  key={fields.firstName.key}
                  placeholder='例: 太郎'
                  fullWidth
                  error={!!fields.firstName.errors?.[0]}
                  errorMessage={
                    fields.firstName.errors?.[0] && <InputErrorMessage>{fields.firstName.errors[0]}</InputErrorMessage>
                  }
                  className={styles.inputField}
                />
              </InputLabel>
            </FlexBox>
          </FlexBox>

          <InputLabel label='表示名 (オプション)'>
            <Input
              {...getInputProps(fields.displayName, { type: 'text' })}
              key={fields.displayName.key}
              placeholder='例: 山田 太郎 (空欄の場合は「姓名」が使用されます)'
              fullWidth
              error={!!fields.displayName.errors?.[0]}
              errorMessage={
                fields.displayName.errors?.[0] && <InputErrorMessage>{fields.displayName.errors[0]}</InputErrorMessage>
              }
              className={styles.inputField}
            />
          </InputLabel>

          <InputLabel label='役割' required>
            <Select
              {...getSelectProps(fields.role)}
              key={fields.role.key}
              options={[...ROLE_OPTIONS]}
              error={!!fields.role.errors?.[0]}
              className={styles.inputField}
              multiple={false}
            />
            {fields.role.errors?.[0] && <InputErrorMessage>{fields.role.errors[0]}</InputErrorMessage>}
          </InputLabel>

          {!isEditMode && (
            <Checkbox
              {...getInputProps(fields.isActive, { type: 'checkbox' })}
              name='isActive'
              label='アクティブなユーザー'
            />
          )}
        </FlexBox>

        <FlexBox justifyContent='flex-end' gap='0.75rem' style={{ marginTop: '0.5rem' }}>
          <Button type='button' size='lg' theme='secondary' variant='outline' onClick={onClose}>
            キャンセル
          </Button>
          <Button type='submit' size='lg' isLoading={isPending} className={styles.submitButton}>
            {getButtonText(isEditMode, isPending)}
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  )
}
