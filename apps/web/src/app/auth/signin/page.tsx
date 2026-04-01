import { FlexBox } from '../../../components/common/FlexBox'
import { Separator } from '../../../components/common/Separator'
import { Typography } from '../../../components/common/Typography'
import { GoogleSignInButton } from './components/GoogleSignInButton'
import { SignInForm } from './components/SignInForm/SignInForm'
import styles from './page.module.css'

export default function Page() {
  return (
    <div className={styles.container}>
      <div className={styles.gridPattern} aria-hidden='true' />
      <div className={styles.card}>
        <FlexBox flexDirection='column' alignItems='center' gap='0.5rem'>
          <Typography className={styles.titleBlue}>ロゴ</Typography>
          <Typography className={styles.title} data-testid='signin-title'>
            サインイン
          </Typography>
        </FlexBox>

        <SignInForm />
        <FlexBox alignItems='center' gap='1rem' style={{ padding: '1rem 0' }} flexDirection='row'>
          <Separator direction='horizontal' width='100%' />
          <Typography size='sm' color='#6b7280' style={{ whiteSpace: 'nowrap' }} data-testid='signin-separator'>
            または
          </Typography>
          <Separator direction='horizontal' width='100%' />
        </FlexBox>
        <GoogleSignInButton />
      </div>
    </div>
  )
}
