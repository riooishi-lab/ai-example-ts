'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { clientEnv } from '../../../../env/client'
import { confirmPasswordResetViaFirebase } from '../../../../libs/auth/firebase'

const ConfirmPasswordResetSchema = z.object({
  oobCode: z.string().min(1, 'リセットコードが必要です'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

export type ConfirmPasswordResetState = {
  status?: 'success' | 'error'
  error?: {
    message: string[]
  }
}

export async function confirmPasswordReset(
  _: ConfirmPasswordResetState | null,
  formData: FormData,
): Promise<ConfirmPasswordResetState> {
  const rawData = {
    oobCode: formData.get('oobCode'),
    password: formData.get('password'),
  }

  const parsed = ConfirmPasswordResetSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      status: 'error',
      error: {
        message: parsed.error.errors.map((e) => e.message),
      },
    }
  }

  const { oobCode, password } = parsed.data

  try {
    await confirmPasswordResetViaFirebase({
      oobCode,
      newPassword: password,
      apiKey: clientEnv.FIREBASE_API_KEY,
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      status: 'error',
      error: {
        message: ['パスワードの再設定に失敗しました。リンクが無効か期限切れの可能性があります。'],
      },
    }
  }

  redirect(PAGE_PATH.SIGN_IN)
}
