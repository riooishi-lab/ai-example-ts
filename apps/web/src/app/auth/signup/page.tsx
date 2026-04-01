import { prisma } from '@monorepo/database/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FlexBox } from '../../../components/common/FlexBox'
import { Separator } from '../../../components/common/Separator'
import { Typography } from '../../../components/common/Typography'
import { PAGE_PATH } from '../../../constants/pagePath'
import { GoogleSignUpButton } from './components/GoogleSignUpButton'
import { SignUpForm } from './components/SignUpForm/SignUpForm'
import styles from './page.module.css'

type Props = {
  searchParams: Promise<{ token: string }>
}

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    notFound()
  }

  const invitation = await prisma.visibleInvitation.findFirst({
    where: { token },
  })

  if (!invitation) {
    return (
      <div className={styles.container}>
        <div className={styles.gridPattern} aria-hidden='true' />
        <div className={`${styles.card} ${styles.errorPage}`}>
          <Typography className={styles.errorTitle} data-testid='signup-error-title'>
            招待が見つかりません
          </Typography>
          <Typography className={styles.errorMessage} data-testid='signup-error-message'>
            招待リンクが無効です。管理者にお問い合わせください。
          </Typography>
          <Link href={PAGE_PATH.SIGN_IN} className={styles.link}>
            サインインページへ
          </Link>
        </div>
      </div>
    )
  }

  if (invitation.status !== 'PENDING') {
    return (
      <div className={styles.container}>
        <div className={styles.gridPattern} aria-hidden='true' />
        <div className={`${styles.card} ${styles.errorPage}`}>
          <Typography className={styles.errorTitle} data-testid='signup-error-title'>
            招待は既に使用済みです
          </Typography>
          <Typography className={styles.errorMessage} data-testid='signup-error-message'>
            この招待リンクは既に使用されています。
          </Typography>
          <Link href={PAGE_PATH.SIGN_IN} className={styles.link}>
            サインインページへ
          </Link>
        </div>
      </div>
    )
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className={styles.container}>
        <div className={styles.gridPattern} aria-hidden='true' />
        <div className={`${styles.card} ${styles.errorPage}`}>
          <Typography className={styles.errorTitle} data-testid='signup-error-title'>
            招待の有効期限切れ
          </Typography>
          <Typography className={styles.errorMessage} data-testid='signup-error-message'>
            この招待リンクは有効期限が切れています。管理者に新しい招待を依頼してください。
          </Typography>
          <Link href={PAGE_PATH.SIGN_IN} className={styles.link}>
            サインインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.gridPattern} aria-hidden='true' />
      <div className={styles.card}>
        <FlexBox flexDirection='column' alignItems='center' gap='0.5rem'>
          <Typography className={styles.titleBlue}>ロゴ</Typography>
          <Typography className={styles.title} data-testid='signup-title'>
            アカウント登録
          </Typography>
        </FlexBox>

        <SignUpForm token={token} email={invitation.email} />

        <FlexBox alignItems='center' gap='1rem' style={{ padding: '1rem 0' }} flexDirection='row'>
          <Separator direction='horizontal' width='100%' />
          <Typography size='sm' color='#6b7280' style={{ whiteSpace: 'nowrap' }}>
            または
          </Typography>
          <Separator direction='horizontal' width='100%' />
        </FlexBox>

        <GoogleSignUpButton token={token} />

        <FlexBox flexDirection='column' alignItems='center' gap='0.5rem'>
          <Typography>
            アカウントをお持ちですか？{' '}
            <Link href={PAGE_PATH.SIGN_IN} className={styles.signInLink}>
              サインイン
            </Link>
          </Typography>
        </FlexBox>
      </div>
    </div>
  )
}
