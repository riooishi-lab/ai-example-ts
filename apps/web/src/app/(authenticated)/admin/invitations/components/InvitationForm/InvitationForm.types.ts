import type { SubmissionResult } from '@conform-to/react'
import type { Invitation } from '@monorepo/database'
import { z } from 'zod'
import { RoleValues } from '../../constants/invitation'

export const InvitationFormSchema = z.object({
  id: z.coerce.number().optional(),
  email: z.string().email('有効なメールアドレスを入力してください'),
  firstName: z.string().min(1, '名を入力してください'),
  lastName: z.string().min(1, '姓を入力してください'),
  displayName: z.string().optional(),
  role: z.enum(RoleValues, {
    errorMap: () => ({ message: '役割を選択してください' }),
  }),
  isActive: z
    .string()
    .optional()
    .transform((v) => v === 'on'),
})

export type InvitationFormValues = z.infer<typeof InvitationFormSchema>

export type InvitationFormProps = {
  invitation?: Invitation
  action: (state: unknown, formData: FormData) => Promise<SubmissionResult<string[]>>
  onSuccess?: () => void
  onClose?: () => void
}
