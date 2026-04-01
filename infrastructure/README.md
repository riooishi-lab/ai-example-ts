# Terraform Infrastructure

このプロジェクトは、AWS上にVPC、RDS、ECS、Route53を使用したWebアプリケーションインフラを構築するためのTerraform設定です。

## アーキテクチャ

以下のAWSリソースを作成します:

- **VPC**: 高可用性マルチAZ構成のVPC
  - パブリックサブネット x2 (各AZに1つ)
  - プライベートサブネット x2 (各AZに1つ)
  - インターネットゲートウェイ
  - NATゲートウェイ x2 (各AZに1つ - 高可用性のため)
- **RDS**: PostgreSQLデータベース（プライベートサブネット、マルチAZ対応可能）
  - カスタムパラメータグループ（日本時間設定、スロークエリログ等）
  - 自動バックアップ、暗号化ストレージ
- **ECR**: Docker イメージレポジトリ
- **ECS**: Fargate クラスタとサービス（ARM64対応）
  - タスク実行ロール（AWS管理ポリシー + Secrets Manager アクセス）
  - CloudWatch Logs統合
  - デプロイ設定（ローリングアップデート、ヘルスチェック猶予期間）
  - ECS Execによるコンテナへのアクセス機能
- **ALB**: Application Load Balancer（パブリックサブネット）
  - ヘルスチェック設定
- **Route53 & ACM**: DNS管理とSSL/TLS証明書
  - 環境別のサブドメイン設定
  - CloudFront用のus-east-1証明書も作成
- **Secrets Manager**: データベースパスワード管理
- **セキュリティグループ**: ALB、ECS、RDS用の最小権限設定
- **IAM**: ECSタスク実行ロールとポリシー

## 前提条件

- Terraform >= 1.8
- AWS CLI設定済み
- 適切なAWS認証情報
- Route53でホストゾーンを管理するドメインが必要

## 使い方

### 1. S3バックエンドの準備

Terraform stateを保存するS3バケットを事前に作成してください:

```bash
aws s3 mb s3://your-terraform-state-bucket --region ap-northeast-1
aws s3api put-bucket-versioning \
  --bucket your-terraform-state-bucket \
  --versioning-configuration Status=Enabled
```

### 2. 環境別の設定ファイルを準備

`environments/`ディレクトリに環境別の変数ファイルがあります:

```bash
# example.tfvarsを参考に、環境に合わせて編集
vi environments/dev.tfvars
vi environments/stg.tfvars
vi environments/prd.tfvars
```

設定可能な変数の詳細は `variables.tf` を参照してください。

### 3. Terraformの初期化（環境別）

```bash
# dev環境の場合
terraform init -backend-config=backends/dev.tfbackend

# stg環境の場合
terraform init -backend-config=backends/stg.tfbackend

# prd環境の場合
terraform init -backend-config=backends/prd.tfbackend
```

### 4. プランの確認

```bash
# dev環境の場合
terraform plan -var-file=environments/dev.tfvars

# stg環境の場合
terraform plan -var-file=environments/stg.tfvars
```

### 5. インフラのデプロイ

```bash
# dev環境の場合
terraform apply -var-file=environments/dev.tfvars

# stg環境の場合
terraform apply -var-file=environments/stg.tfvars
```

確認プロンプトで`yes`と入力します。

## ファイル構成

```
infrastructure/
├── main.tf                      # プロバイダー設定（tokyo/virginia）
├── variables.tf                 # 変数定義
├── vpc.tf                       # VPCリソース（VPC、サブネット、NAT Gateway等）
├── security_groups.tf           # セキュリティグループ（ALB、ECS、RDS）
├── rds.tf                       # RDSリソース（PostgreSQL、パラメータグループ）
├── ecs.tf                       # ECS、ECR、ALB、IAM、Secrets Managerリソース
├── dns.tf                       # Route53、ACM証明書リソース
├── .tflint.hcl                  # TFLint設定
├── .gitignore                   # Git除外設定
├── terraform.example.tfvars     # 変数サンプル（ルート）
├── backends/                    # Terraform バックエンド設定（環境別）
│   ├── dev.tfbackend
│   ├── stg.tfbackend
│   └── prd.tfbackend
├── environments/                # 環境別変数ファイル
│   ├── example.tfvars
│   ├── dev.tfvars
│   ├── stg.tfvars
│   └── prd.tfvars
└── README.md                    # このファイル
```

## 設定変数

設定可能な変数の詳細は `variables.tf` を参照してください。主な設定項目:

- 環境設定（environment, project_name, aws_region）
- VPC/ネットワーク設定
- DNS/ドメイン設定
- RDS/データベース設定
- ECR/ECS設定
- アプリケーション設定

## セキュリティ

### ネットワークセキュリティ
- RDSはプライベートサブネットに配置され、インターネットから直接アクセス不可
- ECSタスクもプライベートサブネットで実行
- ALBのみがパブリックサブネットに配置
- セキュリティグループで最小権限の原則に従ったアクセス制御を実施:
  - ALB → ECS: アプリケーションポートのみ
  - ECS → RDS: PostgreSQLポート（5432）のみ

### データセキュリティ
- データベースパスワードはAWS Secrets Managerで管理
- RDSは暗号化されたストレージ（gp3）を使用
- SSL/TLS証明書はACMで自動管理・更新

### IAMセキュリティ
- ECSタスク実行ロールは必要最小限の権限のみ付与:
  - AWS管理ポリシー: `AmazonECSTaskExecutionRolePolicy`, `AmazonSSMManagedInstanceCore`
  - カスタムインラインポリシー: 特定のSecrets Managerシークレットへのアクセスのみ

## 高可用性設計

### マルチAZ構成
- パブリック/プライベートサブネットを2つのAZに配置
- 各AZに専用のNAT Gatewayを配置（単一障害点の回避）
- プライベートルートテーブルも各AZごとに作成
- RDSのマルチAZ設定可能（`db_multi_az`変数で制御）

### 自動復旧とバックアップ
- RDS自動バックアップ: 7日間保持
- RDSメンテナンスウィンドウ: 月曜日 04:00-05:00（日本時間）
- ECS Fargateの自動タスク再起動
- ALBヘルスチェックによる異常タスクの検知と切り離し
- ECSサービスのローリングアップデート設定

## ECS Fargate ARM64対応

このインフラはECS Fargate ARM64アーキテクチャに対応しています。

### ARM64の利点
- コストが約20%削減（x86_64と比較）
- Apple Silicon Mac（M1/M2/M3）でビルドしたイメージをそのまま使用可能

### Docker イメージのビルド
ARM64イメージをECRにプッシュする際の注意点:

```bash
# Apple Silicon Macの場合（ネイティブビルド）
docker build -t your-image:tag .
docker tag your-image:tag ${ECR_URL}:tag
docker push ${ECR_URL}:tag

# Intel Macまたはx86_64環境の場合（クロスビルド）
docker buildx build --platform linux/arm64 -t ${ECR_URL}:tag --push .
```

タスク定義では `runtime_platform` で ARM64 を指定しています。

## コスト最適化

### 開発環境でコストを抑えるための設定
開発環境では以下の設定でコストを抑えることができます:
- RDSインスタンスクラス: 小さいインスタンスを選択
- RDS Multi-AZ: 無効化
- ECSタスク数: 最小限に設定
- ECS CPU/メモリ: 必要最小限に設定

### コスト削減のオプション
**NAT Gateway削減（開発環境のみ）**:
- 現在: 各AZに1つ（高可用性）
- 削減案: 1つのNAT Gatewayを共有（vpc.tfで `count` を変更）
- 注意: 高可用性は犠牲になります

**ARM64の使用**:
- ARM64アーキテクチャ使用で約20%のコスト削減

本番環境では高可用性とパフォーマンスを優先することを推奨します。

## クリーンアップ

インフラを削除する場合:

```bash
# 環境を指定して削除
terraform destroy -var-file=environments/dev.tfvars
```

**注意事項**:
- 本番環境（prd）では、RDSの削除保護とALBの削除保護が有効です
- 本番環境のRDSは最終スナップショットが自動作成されます
- Route53のホストゾーンは削除されません（手動削除が必要）

## IAMポリシー設計の参考

このプロジェクトでは、以下の3つのIAMリソースを使い分けています:

### `aws_iam_role`
IAMロール本体を作成。誰がこのロールを引き受けられるか（AssumeRole）を定義。

### `aws_iam_role_policy_attachment`
既存のAWS管理ポリシーや別で作成したカスタムマネージドポリシーをロールにアタッチ。
- 使用例: `AmazonECSTaskExecutionRolePolicy` をアタッチ

### `aws_iam_role_policy`
ロール専用のカスタムインラインポリシーを定義。特定のリソースへのアクセス権を細かく制御。
- 使用例: 特定のSecrets Managerシークレットへのアクセス権

**ベストプラクティス**:
- 汎用的な権限 → AWS管理ポリシーを `aws_iam_role_policy_attachment` でアタッチ
- プロジェクト固有の権限 → `aws_iam_role_policy` でインラインポリシーを定義

## トラブルシューティング

### ECSタスクが起動しない
```bash
# ECSタスクのログを確認
aws logs tail /ecs/<project-name>-<environment> --follow

# タスクの停止理由を確認
aws ecs describe-tasks --cluster <cluster-name> --tasks <task-arn>
```

**確認ポイント**:
- ECRイメージが存在し、正しいタグが指定されているか
- イメージのプラットフォームがARM64であるか（Apple Silicon Macでビルドした場合）
- セキュリティグループでALBからのアクセスが許可されているか
- タスク定義のヘルスチェック設定が正しいか
- Secrets Managerのシークレットが存在するか
- IAM AssumeRoleポリシーで `ecs-tasks.amazonaws.com` が指定されているか

### RDSに接続できない
```bash
# セキュリティグループの確認
aws ec2 describe-security-groups --group-ids <rds-sg-id>

# RDSエンドポイントの確認
aws rds describe-db-instances --db-instance-identifier <db-identifier>
```

**確認ポイント**:
- セキュリティグループでECSからのポート5432へのアクセスが許可されているか
- RDSがプライベートサブネットに配置されているか（publicly_accessible: false）
- データベース名、ユーザー名が正しいか
- Secrets Managerのパスワードが正しく設定されているか

### ACM証明書の検証が完了しない
```bash
# 証明書の状態を確認
aws acm describe-certificate --certificate-arn <cert-arn>

# Route53のレコードを確認
aws route53 list-resource-record-sets --hosted-zone-id <zone-id>
```

**確認ポイント**:
- Route53のホストゾーンが正しく作成されているか
- DNSの検証レコードが正しく追加されているか
- ドメインのネームサーバーがRoute53を向いているか (ドメインを管理しているサーバーのDNS設定で`ns-xxx.awsdns-xx.net.`のような値をNSとして登録しているか)

### Terraformのstate不整合
```bash
# stateの現在の状態を確認
terraform show

# 特定のリソースをstateから削除（再作成が必要な場合）
terraform state rm <resource-address>

# stateを最新の状態に同期
terraform refresh -var-file=environments/dev.tfvars
```

## 開発ワークフロー

### コード品質チェック
```bash
# Terraformのフォーマットチェック
terraform fmt -check

# フォーマット自動修正
terraform fmt -recursive

# TFLintによる静的解析
tflint --init
tflint
```

### 環境の切り替え
環境の切り替えにworkspace機能はしないこと
```bash
# dev環境に切り替え
terraform init -backend-config=backends/dev.tfbackend -reconfigure

# stg環境に切り替え
terraform init -backend-config=backends/stg.tfbackend -reconfigure

# prd環境に切り替え
terraform init -backend-config=backends/prd.tfbackend -reconfigure
```

## ライセンス

MIT
