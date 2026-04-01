'use server'

import { prisma } from '@monorepo/database/client'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { composePasswordResetEmail, SENDER } from '../../../../constants/email'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { serverEnv } from '../../../../env/server'
import { sendEmail } from '../../../../libs/email'
import { adminAuth } from '../../../../libs/firebase/nodeApp'

const SendPasswordResetEmailSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export type SendPasswordResetEmailState = {
  status?: 'success' | 'error'
  error?: {
    message: string[]
  }
}

export async function sendPasswordResetEmail(
  _: SendPasswordResetEmailState | null,
  formData: FormData,
): Promise<SendPasswordResetEmailState> {
  const rawData = {
    email: formData.get('email'),
  }

  const parsed = SendPasswordResetEmailSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      status: 'error',
      error: {
        message: parsed.error.errors.map((e) => e.message),
      },
    }
  }

  const { email } = parsed.data

  const user = await prisma.visibleUser.findFirst({
    where: {
      email,
    },
  })
  if (!user) {
    return {
      status: 'error',
      error: {
        message: ['ユーザーが存在しません。'],
      },
    }
  }

  try {
    const actionCodeSettings = {
      url: `${serverEnv.APP_URL}${PAGE_PATH.FORGOT_PASSWORD_RESET}`,
      handleCodeInApp: true,
    }

    const generatedLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings)
    const generatedUrl = new URL(generatedLink)

    const resetUrl = new URL(`${serverEnv.APP_URL}${PAGE_PATH.FORGOT_PASSWORD_RESET}`)
    generatedUrl.searchParams.forEach((value, key) => {
      resetUrl.searchParams.append(key, value)
    })

    await sendEmail({
      to: email,
      from: SENDER,
      subject: '【マイアプリ】パスワードリセットのご案内',
      html: composePasswordResetEmail({ passwordResetUrl: resetUrl }),
    })
  } catch {
    return {
      status: 'error',
      error: {
        message: ['パスワードリセットのメール送信に失敗しました。'],
      },
    }
  }

  redirect(PAGE_PATH.FORGOT_PASSWORD_EMAIL_SENT)
}
