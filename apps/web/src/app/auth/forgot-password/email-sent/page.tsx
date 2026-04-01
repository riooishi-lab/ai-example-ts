import { FlexBox } from '../../../../components/common/FlexBox'
import { Typography } from '../../../../components/common/Typography'
import styles from '../page.module.css'

export default function Page() {
  return (
    <div className={styles.container}>
      <FlexBox flexDirection='column' alignItems='center'>
        <Typography className={styles.title} data-testid='email-sent-title'>
          パスワードの再設定を受け付けました
        </Typography>
        <Typography style={{ maxWidth: '570px', textAlign: 'center' }} data-testid='email-sent-description'>
          ご登録いただいたメールアドレスに確認用リンクをメールにて送付しました。メールから確認用リンクを押すとパスワード再設定が完了いたします。
        </Typography>
      </FlexBox>
    </div>
  )
}
