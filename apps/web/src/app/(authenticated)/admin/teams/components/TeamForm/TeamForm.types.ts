import { z } from 'zod'

export const TeamFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'チーム名は必須です').max(100, 'チーム名は100文字以内で入力してください'),
})

export type TeamFormValues = z.infer<typeof TeamFormSchema>
