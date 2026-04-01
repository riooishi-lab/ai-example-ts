import { redirect } from 'next/navigation'
import { z } from 'zod'
import { FlexBox } from '../../../../components/common/FlexBox'
import { Typography } from '../../../../components/common/Typography'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { PasswordReset } from '../components/PasswordReset'
import styles from '../page.module.css'

const SearchParamsSchema = z.object({
  oobCode: z.string(),
})

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const parsed = SearchParamsSchema.safeParse(params)

  if (!parsed.success) {
    redirect(PAGE_PATH.FORGOT_PASSWORD)
  }

  const { oobCode } = parsed.data

  return (
    <div className={styles.container}>
      <div className={styles.gridPattern} aria-hidden='true' />
      <div className={styles.card}>
        <FlexBox flexDirection='column' alignItems='center'>
          <Typography className={styles.titleBlue}>ロゴ</Typography>
          <Typography className={styles.title} data-testid='password-reset-title'>
            パスワード再設定
          </Typography>
        </FlexBox>

        <PasswordReset oobCode={oobCode} />
      </div>
    </div>
  )
}
