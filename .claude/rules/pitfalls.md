# Pitfalls

バグを防ぐために知っておくべき注意点。フレームワークの仕様や挙動に起因する落とし穴をまとめる。

## Next.js

### 1. revalidatePath / redirect / notFound を try/catch 内に置かない

Next.js は `redirect()`, `notFound()`, `revalidatePath()`, `revalidateTag()` の内部で例外ベースの制御フローを使用している。これらの関数は意図的に特殊なエラーを throw する（例: `redirect()` は `NEXT_REDIRECT` を throw）。

`try` ブロック内で呼ぶと、汎用の `catch` が制御フロー用の例外を捕捉してしまい、機能が壊れる。

```typescript
// ❌ WRONG - revalidatePath が throw する例外が catch に捕捉される
export async function deleteItem(formData: FormData) {
  try {
    await prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    revalidatePath('/items')
  } catch {
    return errorResult('削除に失敗しました')
  }
  return successResult()
}

// ✅ CORRECT - try 内は DB 操作のみ、revalidatePath は外
export async function deleteItem(formData: FormData) {
  try {
    await prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  } catch {
    return errorResult('削除に失敗しました')
  }

  revalidatePath('/items')
  return successResult()
}
```

Server Action の構造は以下の順序で書く:

1. 認証チェック — `try` の外
2. バリデーション — `try` の外
3. 認可チェック（テナント検証など） — `try` の外
4. DB 書き込み — `try` の中（ここだけ）
5. `revalidatePath` / `redirect` — `try` の外

### 2. 環境変数の集約定義には getter ではなく IIFE を使う

環境変数をオブジェクトに集約して定義する際、getter (`get XXX()`) を使うとプロパティへのアクセスごとに `process.env` を読みに行く（ランタイム評価）。IIFE (`(() => { ... })()`) を使えばモジュール読み込み時に一度だけ評価される（ビルド時評価）。

このルールは `env/server.ts` / `env/client.ts` に限らず、環境変数を集約定義するすべてのファイルに適用する。

**getter が問題になる理由:**

1. **ビルド時に環境変数の欠落を検出できない** — getter はアクセスされるまで評価されないため、未設定の環境変数がデプロイ後の実行時に初めてエラーになる。IIFE ならビルド時に即座に失敗し、デプロイ前に問題を検出できる。
2. **不要な再評価コスト** — getter は毎回 `process.env` を参照する。環境変数は実行中に変わらないため、毎回読む意味がない。
3. **Next.js のインライン化が効かない** — Next.js はビルド時に `process.env.XXX` を文字列リテラルにインライン化するが、getter 経由だとこの最適化が適用されない場合がある。

```typescript
// ❌ WRONG - getter（ランタイム評価）
export const serverEnv = {
  get API_KEY() {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    const value = process.env.API_KEY
    if (typeof value !== 'string') throw new Error('`API_KEY` is not properly set.')
    return value
  },
}

// ✅ CORRECT - IIFE（ビルド時評価）
export const serverEnv = {
  API_KEY: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.API_KEY !== 'string') throw new Error('`API_KEY` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.API_KEY
  })(),
}
```

### 3. Next.js middleware の rewrite は request.url を書き換えない

`NextResponse.rewrite()` は Next.js の**内部ルーティング**を変更するが、ルートハンドラーが受け取る `request.url` には**元の URL がそのまま残る**。

Hono を `app/api/[[...route]]/route.ts` にマウントしている場合、`hono/vercel` の `handle(app)` は `request.url` からパスを読むため、rewrite 前のパスで Hono のルートマッチングが行われる。

```typescript
// ❌ WRONG - /t/:slug/api/... を /api/... に rewrite する設計
// Next.js middleware
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/api/videos'  // rewrite 先
  return NextResponse.rewrite(url)
}

// route.ts — Hono は request.url から /t/acme/api/videos を読み、
// basePath '/api' とマッチしないため 404 になる
export const GET = handle(app)
```

```typescript
// ✅ CORRECT - API パスはフレームワークのマウントポイントに合わせる
// /api/t/:slug/videos として Hono が直接ルーティング
const tenantApp = new Hono<AppEnv>()
tenantApp.use('*', tenantMiddleware)
tenantApp.route('/videos', videos)

app.route('/t/:slug', tenantApp)  // → /api/t/:slug/videos
```

**設計原則:** API の URL はフレームワーク（Hono）のマウントポイント（`/api/[[...route]]`）を起点に設計する。ページの URL 構造（`/t/:slug/...`）から逆算して rewrite に頼ると、`request.url` の不一致で壊れる。rewrite が必要になった時点で URL 設計を疑う。

## Hono

### 1. app.use() のパスパラメータ付きパターンが期待通りに動かない場合がある

`app.use('/t/:slug/*', middleware)` のようなパスパラメータ + ワイルドカードの組み合わせは、`app.route()` で同じパスにマウントされたサブルーターのミドルウェアとして機能しないことがある。

```typescript
// ❌ UNRELIABLE - app.use のパスパラメータが route と一致しない場合がある
app.use('/t/:slug/*', tenantMiddleware)
app.route('/t/:slug/sample', sample)

// ✅ CORRECT - サブルーターにミドルウェアを適用
const tenantApp = new Hono<AppEnv>()
tenantApp.use('*', tenantMiddleware)
tenantApp.route('/sample', sample)

app.route('/t/:slug', tenantApp)
```

テナントスコープなど、特定のパスプレフィックスにミドルウェアを適用したい場合は、サブルーター（`new Hono()`）を作成し、そのサブルーターに `use('*', middleware)` を設定してから `app.route()` でマウントする。
