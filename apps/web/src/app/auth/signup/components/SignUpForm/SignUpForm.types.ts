import { z } from 'zod'

export const SignUpFormSchema = z
  .object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    token: z.string().min(1),
    password: z
      .string()
      .min(6, 'パスワードは6文字以上で入力してください')
      .max(16, 'パスワードは16文字以内で入力してください'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type SignUpFormValues = z.infer<typeof SignUpFormSchema>
