'use client'

import { useTransition } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '../../../../components/common/Button'
import { googleOAuthSignUp } from '../actions/googleOAuth'
import styles from '../page.module.css'

type Props = {
  token: string
}

export function GoogleSignUpButton({ token }: Props) {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await googleOAuthSignUp(token)
    })
  }

  return (
    <Button
      type='button'
      onClick={handleClick}
      disabled={pending}
      size='lg'
      isFullWidth
      isLoading={pending}
      className={styles.googleButton}
    >
      <FcGoogle size={18} />
      {pending ? 'リダイレクト中...' : 'Googleで登録'}
    </Button>
  )
}
