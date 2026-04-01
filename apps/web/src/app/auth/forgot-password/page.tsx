import Link from 'next/link'
import { FaKey } from 'react-icons/fa'
import { IoIosArrowBack } from 'react-icons/io'
import { FlexBox } from '../../../components/common/FlexBox'
import { Typography } from '../../../components/common/Typography'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import styles from './page.module.css'

export default function Page() {
  return (
    <div className={styles.container}>
      <div className={styles.gridPattern} aria-hidden='true' />
      <div className={styles.card}>
        <FlexBox flexDirection='column' alignItems='center'>
          <div className={styles.icon}>
            <FaKey size={28} color='#FFFFFF' />
          </div>
          <Typography className={styles.title} data-testid='forgot-password-title'>
            パスワード再設定送信
          </Typography>
          <Typography className={styles.description} data-testid='forgot-password-description'>
            パスワードリセット手順をお送りします。
          </Typography>
        </FlexBox>

        <ForgotPasswordForm />

        <FlexBox
          alignItems='center'
          justifyContent='center'
          flexDirection='row'
          gap='0.5rem'
          className={styles.backToLoginLink}
        >
          <IoIosArrowBack size={20} />
          <Link href='/auth/signin' data-testid='forgot-password-back-to-signin'>
            ログイン画面に戻る
          </Link>
        </FlexBox>
      </div>
    </div>
  )
}
