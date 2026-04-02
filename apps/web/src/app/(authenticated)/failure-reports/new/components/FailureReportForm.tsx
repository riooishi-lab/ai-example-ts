'use client'

import { getInputProps, getSelectProps, getTextareaProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import type { ChangeEvent } from 'react'
import { useActionState, useCallback, useMemo, useState } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Input } from '../../../../../components/common/Input'
import { InputErrorMessage } from '../../../../../components/common/InputErrorMessage'
import { InputLabel } from '../../../../../components/common/InputLabel'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Select } from '../../../../../components/common/Select'
import Textarea from '../../../../../components/common/Textarea'
import { Typography } from '../../../../../components/common/Typography'
import { zodFormErrorMap } from '../../../../../utils/libs/zod'
import styles from './FailureReportForm.module.css'
import type { FailureReportFormProps } from './FailureReportForm.types'
import { FailureReportFormSchema } from './FailureReportForm.types'

const MAX_PHOTOS = 10

export function FailureReportForm({ equipments, parts, users, action }: FailureReportFormProps) {
  const [lastResult, formAction, isPending] = useActionState(action, null)
  const [selectedEquipmentPublicId, setSelectedEquipmentPublicId] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: FailureReportFormSchema, errorMap: zodFormErrorMap })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  const filteredParts = useMemo(
    () => parts.filter((part) => part.equipmentPublicId === selectedEquipmentPublicId),
    [parts, selectedEquipmentPublicId],
  )

  const equipmentOptions = useMemo(
    () => equipments.map((e) => ({ value: e.publicId, label: `${e.lineName} - ${e.name}` })),
    [equipments],
  )

  const partOptions = useMemo(() => filteredParts.map((p) => ({ value: p.publicId, label: p.name })), [filteredParts])

  const userOptions = useMemo(
    () => users.map((u) => ({ value: u.publicId, label: `${u.lastName} ${u.firstName}` })),
    [users],
  )

  const handlePhotoChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return

      const newFiles = Array.from(files)
      const totalCount = photoFiles.length + newFiles.length
      const filesToAdd = totalCount > MAX_PHOTOS ? newFiles.slice(0, MAX_PHOTOS - photoFiles.length) : newFiles

      const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file))

      setPhotoFiles((prev) => [...prev, ...filesToAdd])
      setPhotoPreviews((prev) => [...prev, ...newPreviews])
      e.target.value = ''
    },
    [photoFiles.length],
  )

  const handleRemovePhoto = useCallback(
    (index: number) => {
      URL.revokeObjectURL(photoPreviews[index])
      setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
      setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
    },
    [photoPreviews],
  )

  return (
    <form action={formAction} id={form.id} onSubmit={form.onSubmit} className={styles.form}>
      <FlexBox flexDirection='column' gap='1.5rem'>
        {lastResult?.status === 'error' && !isPending && lastResult.error?.message?.[0] && (
          <MessageBox theme='error'>
            <Typography size='sm'>{lastResult.error.message[0]}</Typography>
          </MessageBox>
        )}

        <InputLabel label='設備' required>
          <Select
            {...getSelectProps(fields.equipmentPublicId)}
            key={fields.equipmentPublicId.key}
            options={equipmentOptions}
            placeholder='設備を選択してください'
            error={!!fields.equipmentPublicId.errors?.[0]}
            className={styles.inputField}
            multiple={false}
            onChange={(option) => {
              setSelectedEquipmentPublicId(option?.value ?? '')
            }}
          />
          {fields.equipmentPublicId.errors?.[0] && (
            <InputErrorMessage>{fields.equipmentPublicId.errors[0]}</InputErrorMessage>
          )}
        </InputLabel>

        <InputLabel label='部品'>
          <Select
            {...getSelectProps(fields.partPublicId)}
            key={fields.partPublicId.key}
            options={partOptions}
            placeholder={selectedEquipmentPublicId ? '部品を選択してください' : '先に設備を選択してください'}
            disabled={!selectedEquipmentPublicId}
            isClearable
            error={!!fields.partPublicId.errors?.[0]}
            className={styles.inputField}
            multiple={false}
          />
        </InputLabel>

        <InputLabel label='発生日時' required>
          <Input
            {...getInputProps(fields.occurredAt, { type: 'datetime-local' })}
            key={fields.occurredAt.key}
            fullWidth
            error={!!fields.occurredAt.errors?.[0]}
            errorMessage={
              fields.occurredAt.errors?.[0] && <InputErrorMessage>{fields.occurredAt.errors[0]}</InputErrorMessage>
            }
            className={styles.inputField}
          />
        </InputLabel>

        <InputLabel label='症状' required>
          <Textarea
            {...getTextareaProps(fields.symptom)}
            key={fields.symptom.key}
            rows={4}
            placeholder='不具合の症状を記入してください'
            fullWidth
            error={fields.symptom.errors?.[0]}
            className={styles.inputField}
          />
        </InputLabel>

        <InputLabel label='推定原因'>
          <Textarea
            {...getTextareaProps(fields.estimatedCause)}
            key={fields.estimatedCause.key}
            rows={3}
            placeholder='推定原因があれば記入してください'
            fullWidth
            error={fields.estimatedCause.errors?.[0]}
            className={styles.inputField}
          />
        </InputLabel>

        <InputLabel label='対応内容' required>
          <Textarea
            {...getTextareaProps(fields.action)}
            key={fields.action.key}
            rows={4}
            placeholder='実施した対応内容を記入してください'
            fullWidth
            error={fields.action.errors?.[0]}
            className={styles.inputField}
          />
        </InputLabel>

        <InputLabel label='対応日時' required>
          <Input
            {...getInputProps(fields.actionAt, { type: 'datetime-local' })}
            key={fields.actionAt.key}
            fullWidth
            error={!!fields.actionAt.errors?.[0]}
            errorMessage={
              fields.actionAt.errors?.[0] && <InputErrorMessage>{fields.actionAt.errors[0]}</InputErrorMessage>
            }
            className={styles.inputField}
          />
        </InputLabel>

        <InputLabel label='対応者' required>
          <Select
            {...getSelectProps(fields.responderPublicId)}
            key={fields.responderPublicId.key}
            options={userOptions}
            placeholder='対応者を選択してください'
            error={!!fields.responderPublicId.errors?.[0]}
            className={styles.inputField}
            multiple={false}
          />
          {fields.responderPublicId.errors?.[0] && (
            <InputErrorMessage>{fields.responderPublicId.errors[0]}</InputErrorMessage>
          )}
        </InputLabel>

        <InputLabel label='備考'>
          <Textarea
            {...getTextareaProps(fields.note)}
            key={fields.note.key}
            rows={2}
            placeholder='備考があれば記入してください'
            fullWidth
            error={fields.note.errors?.[0]}
            className={styles.inputField}
          />
        </InputLabel>

        <InputLabel label={`写真（最大${MAX_PHOTOS}枚）`}>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={handlePhotoChange}
            disabled={photoFiles.length >= MAX_PHOTOS}
          />
          {photoFiles.length > 0 && (
            <div className={styles.photoPreviewGrid}>
              {photoPreviews.map((preview, index) => (
                <div key={preview} className={styles.photoPreviewItem}>
                  <img src={preview} alt={photoFiles[index].name} />
                  <button type='button' className={styles.photoPreviewRemove} onClick={() => handleRemovePhoto(index)}>
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </InputLabel>

        <FlexBox justifyContent='flex-end' gap='0.75rem' style={{ marginTop: '0.5rem' }}>
          <Button type='submit' size='lg' isLoading={isPending} className={styles.submitButton}>
            {isPending ? '登録中...' : '登録'}
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  )
}
