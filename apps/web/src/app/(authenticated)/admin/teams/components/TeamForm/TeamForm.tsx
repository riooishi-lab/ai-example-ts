'use client'

import { getInputProps, type SubmissionResult, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../../components/common/Button'
import { FlexBox } from '../../../../../../components/common/FlexBox'
import { Input } from '../../../../../../components/common/Input'
import { InputErrorMessage } from '../../../../../../components/common/InputErrorMessage'
import { InputLabel } from '../../../../../../components/common/InputLabel'
import { zodFormErrorMap } from '../../../../../../utils/libs/zod'
import styles from '../../../settings/page.module.css'
import { TeamFormSchema } from './TeamForm.types'

type TeamFormProps = {
  defaultName?: string
  teamId?: number
  action: (state: unknown, formData: FormData) => Promise<SubmissionResult<string[]>>
  onCancel: () => void
  onSuccess: () => void
  onError?: (message: string) => void
}

export function TeamForm({ defaultName, teamId, action, onCancel, onSuccess, onError }: TeamFormProps) {
  const [lastResult, formAction, isPending] = useActionState(action, {
    error: undefined,
  })

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      name: defaultName ?? '',
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: TeamFormSchema, errorMap: zodFormErrorMap })
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
    <form action={formAction} onSubmit={form.onSubmit} id={form.id}>
      {teamId && <input type='hidden' name='id' value={teamId.toString()} />}
      <FlexBox flexDirection='column' gap='1.5rem'>
        <InputLabel label='チーム名' required>
          <Input
            placeholder='チーム名を入力してください'
            data-testid='team-name-input'
            {...getInputProps(fields.name, { type: 'text' })}
            fullWidth
            error={!!fields.name.errors?.[0]}
            errorMessage={fields.name.errors?.[0] && <InputErrorMessage>{fields.name.errors[0]}</InputErrorMessage>}
          />
        </InputLabel>

        <FlexBox justifyContent='flex-end' gap='0.75rem'>
          <Button
            type='button'
            size='lg'
            theme='secondary'
            variant='outline'
            onClick={onCancel}
            data-testid='team-form-cancel-button'
          >
            キャンセル
          </Button>
          <Button
            type='submit'
            size='lg'
            isLoading={isPending}
            className={styles.submitButton}
            data-testid='team-form-submit-button'
          >
            保存
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  )
}
