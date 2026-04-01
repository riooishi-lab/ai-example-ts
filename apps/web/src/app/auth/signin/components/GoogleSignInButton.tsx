'use client'

import { useTransition } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '../../../../components/common/Button'
import { FlexBox } from '../../../../components/common/FlexBox'
import { googleOAuthSignIn } from '../actions/googleOAuth'
import styles from '../page.module.css'

export function GoogleSignInButton() {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await googleOAuthSignIn()
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
      data-testid='signin-google-button'
    >
      <FlexBox alignItems='center' justifyContent='center' gap='0.5rem'>
        <FcGoogle size={18} />
        {pending ? 'リダイレクト中...' : 'Googleでサインイン'}
      </FlexBox>
    </Button>
  )
}
