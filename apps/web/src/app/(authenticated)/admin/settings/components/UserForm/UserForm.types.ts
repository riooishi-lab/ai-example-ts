import { z } from 'zod'
import { RoleValues } from '../../../invitations/constants/invitation'

export const UserFormSchema = z.object({
  id: z.string().min(1, 'ユーザーIDは必須です'),
  firstName: z.string().min(1, '名は必須です'),
  lastName: z.string().min(1, '姓は必須です'),
  displayName: z.string().optional(),
  role: z.enum(RoleValues, {
    errorMap: () => ({ message: '役割は必須です' }),
  }),
  isActive: z.coerce.boolean(),
})

export type UserFormValues = z.infer<typeof UserFormSchema>
