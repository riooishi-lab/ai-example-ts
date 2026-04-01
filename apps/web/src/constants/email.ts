export const SENDER = 'サポートチーム <developer@aix-sales.com>'

export const composePasswordResetEmail = ({ passwordResetUrl }: { passwordResetUrl: URL }) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <p>パスワードリセットのリクエストを受け付けました。</p>
    <p>
        以下のリンクをクリックして、新しいパスワードを設定してください。<br />
        <a href="${passwordResetUrl.toString()}">パスワードを再設定する</a>
    </p>
    <p>このリンクは1時間後に無効になります。</p>
    <p>心当たりがない場合は、このメールを無視してください。</p>
    <p>※このメールは送信専用です。返信いただいてもご回答できませんのでご了承ください。</p>
    </div>
`

export const composeInvitationEmail = ({
  signUpPageUrl,
  signInPageUrl,
}: {
  signUpPageUrl: URL
  signInPageUrl: URL
}) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>マイアプリへの招待を受け取りました。</p>
      <p>
          以下のURLよりアカウントのご登録をお願いいたします。<br />
          <a href="${signUpPageUrl.toString()}">新規登録ページ</a>
      </p>
      <p>
          アカウント登録後、以下のURLからログインできます。<br />
          <a href="${signInPageUrl.toString()}">サインインページ</a>
      </p>
      <p>※このメールは送信専用です。返信いただいてもご回答できませんのでご了承ください。</p>
      </div>
  `
