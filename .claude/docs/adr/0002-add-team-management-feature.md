# 0002. チーム管理機能の追加

## Status

Proposed

## Date

2026-03-19

## Context

本アプリケーションではユーザー管理・招待管理機能が存在するが、ユーザーをグループ化するチーム機能がなかった。ユーザーが複数のチームに所属できる多対多の関係が必要とされた。

既存のデータモデル（User, Invitation）は soft delete パターンと Visible ビューを採用しており、新機能もこれに準拠する必要があった。

UI は既存の管理画面（ユーザー管理・招待管理）のパターンに倣い、一貫性を保つ設計とした。

## Decision

### データモデル
- `Team` モデル（id, publicId, name, timestamps, deletedAt）と `TeamMember` 中間テーブル（teamId, userId, timestamps, deletedAt）を追加
- `VisibleTeam` / `VisibleTeamMember` ビューを作成し、soft delete フィルタリングに対応
- `TeamMember` に `@@unique([teamId, userId])` 制約を設定。soft delete 済みレコードの再追加は既存レコードの `deletedAt` を null に戻すことで対応

### UI・サーバーアクション
- Settings ページ（`/admin/settings`）の3つ目のタブとして統合し、既存の管理画面と同じコンポーネントパターン（Table, Modal, Form with Conform + Zod）を採用
- サーバーアクション: createTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember
- チーム内の役割（リーダー等）は不要と判断し、シンプルな所属関係のみとした
- テナントスコープは現状のアプリに存在しないため今回は見送り

### 共通化
- `ActionResult` 型と `errorResult` / `successResult` ヘルパーを `admin/utils/actionResult.ts` に抽出し、サーバーアクション間の重複を排除

## Consequences

### Positive

- ユーザーを複数チームに柔軟にグルーピング可能
- 既存パターンに準拠した一貫性のある実装
- soft delete 対応により、データの安全な削除・復元が可能
- サーバーアクションのヘルパー共通化により保守性向上

### Negative

- `@@unique([teamId, userId])` は DB レベルの制約であり、soft delete との組み合わせでは、再追加時に必ず既存レコードの復元ロジックが必要
- `VisibleTeam` / `VisibleTeamMember` ビューは Prisma でリレーションを持てないため、チーム一覧取得時は base model に `deletedAt: null` フィルタを使用する必要がある
- マイグレーションが既存の不要テーブル削除を含むため、本番適用時は慎重な確認が必要

## Compliance

- Prisma スキーマに `Team`, `TeamMember` モデルと対応する `Visible` ビューが定義されていること
- 全サーバーアクションで `checkIsAdminOrSuperAdmin()` による認可チェックが実施されていること
- 全データベースクエリで soft delete フィルタ（`deletedAt: null`）が適用されていること
- `Number.isNaN()` による入力値のバリデーションが実施されていること
- ビルド（`pnpm --filter web build`）が成功すること

## Notes

- Author: Claude Code
- Version: 0.1
- Changelog:
  - 0.1: Initial proposed version
