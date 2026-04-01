# Next.js Sample Application - ECS on Fargate Template

Next.jsアプリケーションをECS on FargateにデプロイするためのMonorepoテンプレートプロジェクト

## プロジェクト概要

このプロジェクトは、今後のアプリケーション開発の雛形として使用するためのサンプルアプリケーションです。pnpmワークスペースを使用したMonorepo構成で、最低限の認証・ユーザー管理・招待管理機能を含んでいます。

### 含まれる機能

- **認証機能**: サインイン、サインアップ、パスワードリセット（Firebase Authentication）
- **ユーザー管理**: ユーザーの作成、編集、削除、一覧表示
- **招待管理**: 招待の作成、編集、削除、一覧表示
- **権限管理**: ロールベースのアクセス制御（SUPER_ADMIN、ADMIN、MANAGER、SALES_REP、VIEWER）

### 技術スタック

- **フロントエンド**: Next.js 16.0.1, React 19.2.0
- **パッケージマネージャー**: pnpm 10.14.0
- **データベース**: PostgreSQL (AWS RDS)
- **ORM**: Prisma
- **インフラストラクチャ**: Terraform
- **コンテナ**: Docker (ARM64対応)
- **デプロイ先**: AWS ECS on Fargate
- **コード品質**: Biome, Husky
- **その他**: TypeScript, React Compiler

## プロジェクト構造

```
sample-cc/
├── apps/                      # アプリケーション
│   └── web/                  # メインアプリケーション (Next.js)
│       ├── src/
│       │   ├── app/
│       │   │   ├── auth/     # 認証関連ページ
│       │   │   └── (authenticated)/
│       │   │       └── admin/
│       │   │           ├── settings/    # ユーザー管理
│       │   │           └── invitations/ # 招待管理
│       │   ├── components/   # 共通コンポーネント
│       │   └── libs/         # ライブラリ
├── packages/                  # 共通パッケージ
│   └── database/             # Prismaスキーマと型定義
│       └── prisma/
│           └── schema.prisma # データベーススキーマ（User、Invitation）
├── infrastructure/            # Terraformによるインフラ定義
│   ├── main.tf               # プロバイダー設定
│   ├── vpc.tf                # VPC、サブネット、NAT Gateway
│   ├── ecs.tf                # ECS、ECR、ALB、IAM
│   ├── rds.tf                # PostgreSQL RDS
│   ├── dns.tf                # Route53、ACM
│   ├── security_groups.tf    # セキュリティグループ
│   ├── environments/         # 環境別変数ファイル
│   └── backends/             # Terraform stateバックエンド設定
├── docker/                    # Dockerfileコレクション
│   ├── web/                  # web用Dockerfile
│   └── db-migration/         # DBマイグレーション用
├── scripts/                   # デプロイスクリプト
│   ├── deploy_web.sh
│   └── deploy_db_migration.sh
└── pnpm-workspace.yaml       # pnpmワークスペース設定
```

## セットアップ

### 前提条件

- Node.js 24 以上
- pnpm 10.14.0 以上
- Docker Desktop
- AWS CLI (デプロイ時)
- Terraform >= 1.8 (インフラ構築時)

### ローカル開発環境のセットアップ

1. **リポジトリのクローン**

```bash
git clone <repository-url>
cd schema
```

2. **依存関係のインストール**

```bash
pnpm install
```

3. **環境変数の設定**

```bash
# ルートディレクトリ
cp .env.example .env

# databaseパッケージ
cp packages/database/.env.example packages/database/.env

# web app
cp apps/web/.env.example apps/web/.env
```

4. **Prismaのセットアップ**

```bash
# Prisma Clientの生成
pnpm --filter database db:generate

# マイグレーションの実行
pnpm --filter database db:deploy
```

5. **開発サーバーの起動**

```bash
# 開発サーバーの起動
pnpm dev

# または
pnpm --filter web dev
```

6. **Prisma Studioの起動（オプション）**

```bash
pnpm studio
```

## ECS on FargateへのNext.jsデプロイ

### アーキテクチャ概要

```
インターネット
    ↓
Application Load Balancer (HTTPS)
    ↓
ECS Service (Fargate)
    ├── web コンテナ (ARM64)
    │   └── Next.js (standalone mode)
    └── データベース接続 → RDS PostgreSQL
```

### 1. インフラストラクチャの構築

#### 1.1 S3バックエンドの準備

```bash
# Terraform state保存用のS3バケットを作成
aws s3 mb s3://your-terraform-state-bucket --region ap-northeast-1
aws s3api put-bucket-versioning \
  --bucket your-terraform-state-bucket \
  --versioning-configuration Status=Enabled
```

#### 1.2 環境変数の設定

```bash
cd infrastructure

# 環境別のtfvarsファイルを編集
cp environments/example.tfvars environments/dev.tfvars
vi environments/dev.tfvars
```

主な設定項目:

```hcl
# environments/dev.tfvars の例
environment         = "dev"
project_name        = "schema"
aws_region          = "ap-northeast-1"

# ドメイン設定
domain_name         = "example.com"
subdomain           = "dev"  # dev.example.com

# ECR設定
ecr_repository_name = "web"
ecs_image_tag       = "latest"

# ECS設定
ecs_task_cpu        = "256"   # 0.25 vCPU
ecs_task_memory     = "512"   # 512 MB
app_count           = 1       # タスク数
app_port            = 3000    # Next.jsのポート

# データベース設定
db_name             = "schema_dev"
db_username         = "admin"
db_password         = "your-secure-password"  # 本番環境ではSecrets Managerを使用
db_instance_class   = "db.t4g.micro"
```

#### 1.3 バックエンド設定

```bash
# backends/dev.tfbackend を編集
vi backends/dev.tfbackend
```

```hcl
bucket  = "your-terraform-state-bucket"
key     = "dev/terraform.tfstate"
region  = "ap-northeast-1"
encrypt = true
```

#### 1.4 Terraformの実行

```bash
# 初期化
terraform init -backend-config=backends/dev.tfbackend

# プランの確認
terraform plan -var-file=environments/dev.tfvars

# インフラのデプロイ
terraform apply -var-file=environments/dev.tfvars
```

デプロイされるリソース:
- VPC (マルチAZ: パブリック/プライベートサブネット x2)
- NAT Gateway x2 (高可用性)
- Application Load Balancer (HTTPS)
- ECS Cluster (Fargate)
- ECR Repository
- RDS PostgreSQL (プライベートサブネット)
- Route53 DNS レコード
- ACM SSL/TLS証明書
- セキュリティグループ (ALB、ECS、RDS)
- IAM Role (ECS Task Execution)
- Secrets Manager (データベース接続情報)
- CloudWatch Logs

### 2. Dockerイメージのビルドとプッシュ

#### 2.1 ECRログイン情報の取得

```bash
# Terraformの出力からECRのURLを取得
cd infrastructure
terraform output ecr_repository_url

# 出力例: 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/account-app-dev
```

#### 2.2 イメージのビルドとプッシュ

**方法1: デプロイスクリプトを使用（推奨）**

```bash
cd scripts

# 使い方: ./deploy_web.sh <AWS_ACCOUNT_ID> <ECR_REPO_NAME> <TAG>
./deploy_web.sh 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com web-dev latest
```

**方法2: 手動でビルド＆プッシュ**

```bash
# プロジェクトルートに移動
cd /path/to/schema

# 環境変数の設定
export AWS_REGION=ap-northeast-1
export AWS_ACCOUNT_ID=123456789012
export ECR_REPO_NAME=web-dev
export IMAGE_TAG=latest
export ECR_URL=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}

# Dockerイメージのビルド
docker build \
  -t ${ECR_URL}:${IMAGE_TAG} \
  -f docker/web/Dockerfile \
  .

# ECRへのログイン
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# イメージのプッシュ
docker push ${ECR_URL}:${IMAGE_TAG}
```

#### 2.3 ARM64対応について

このプロジェクトのECS TaskはARM64アーキテクチャで動作します（ecs.tf:99-102）。

**Apple Silicon Mac (M1/M2/M3) の場合:**
```bash
# ネイティブでARM64イメージがビルドされる
docker build -t ${ECR_URL}:${IMAGE_TAG} -f docker/web/Dockerfile .
```

**Intel Mac または x86_64環境の場合:**
```bash
# クロスビルドが必要
docker buildx build \
  --platform linux/arm64 \
  -t ${ECR_URL}:${IMAGE_TAG} \
  -f docker/web/Dockerfile \
  --push \
  .
```

### 3. ECSタスクのデプロイ

#### 3.1 新しいタスク定義のデプロイ

イメージをプッシュした後、ECSサービスが自動的に新しいイメージを使用します。
Terraformで `force_new_deployment = true` が設定されているため、タスク定義が更新されます（ecs.tf:229）。

手動で強制デプロイする場合:

```bash
# クラスター名とサービス名を取得
aws ecs list-clusters
aws ecs list-services --cluster schema-dev-cluster

# サービスの強制デプロイ
aws ecs update-service \
  --cluster schema-dev-cluster \
  --service schema-dev-service \
  --force-new-deployment
```

#### 3.2 デプロイの確認

```bash
# ECSタスクの状態を確認
aws ecs describe-services \
  --cluster schema-dev-cluster \
  --services schema-dev-service

# タスクの一覧を取得
aws ecs list-tasks --cluster schema-dev-cluster

# ログの確認
aws logs tail /ecs/schema-dev --follow
```

#### 3.3 ヘルスチェック

ALBのターゲットグループは以下のヘルスチェックを実行します（ecs.tf:167-176）:
- パス: `/` (variables.tfの `health_check_path` で変更可能)
- 正常しきい値: 2回
- 異常しきい値: 3回
- タイムアウト: 5秒
- 間隔: 30秒
- 期待するステータスコード: 200

### 4. アプリケーションへのアクセス

#### 4.1 ALBのDNS名を取得

```bash
cd infrastructure
terraform output alb_dns_name

# 出力例: schema-dev-alb-1234567890.ap-northeast-1.elb.amazonaws.com
```

#### 4.2 カスタムドメインでのアクセス

Route53とACMが設定されているため、カスタムドメインでアクセスできます:

```
https://dev.example.com
```

**DNS設定の確認:**
1. ドメインレジストラで、Route53のネームサーバーを設定
2. ACM証明書の検証が完了していることを確認

```bash
# 証明書の状態を確認
aws acm list-certificates --region ap-northeast-1

# Route53のレコードを確認
aws route53 list-resource-record-sets --hosted-zone-id <ZONE_ID>
```

### 5. データベースマイグレーション

アプリケーションデプロイ後、初回のみデータベースマイグレーションを実行します。

#### 5.1 ECS Execでコンテナに接続

```bash
# タスクIDを取得
TASK_ARN=$(aws ecs list-tasks \
  --cluster schema-dev-cluster \
  --service-name schema-dev-service \
  --query 'taskArns[0]' \
  --output text)

# コンテナに接続
aws ecs execute-command \
  --cluster schema-dev-cluster \
  --task ${TASK_ARN} \
  --container schema-app \
  --interactive \
  --command "/bin/sh"
```

#### 5.2 マイグレーションの実行

```bash
# コンテナ内で実行
cd /workspace/packages/database
npx prisma migrate deploy
```

または、専用のマイグレーションタスクを使用:

```bash
# database_migration_ecs.tf で定義されているマイグレーションタスクを実行
aws ecs run-task \
  --cluster schema-dev-cluster \
  --task-definition schema-dev-db-migration \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"
```

### 6. CI/CDパイプライン（オプション）

GitHub Actionsを使用した自動デプロイの例:

```yaml
# .github/workflows/deploy-web.yml
name: Deploy Web App to ECS

on:
  push:
    branches:
      - main
    paths:
      - 'apps/web/**'
      - 'packages/database/**'

env:
  AWS_REGION: ap-northeast-1
  ECR_REPOSITORY: web-dev

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build \
            -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
            -f docker/web/Dockerfile \
            .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster schema-dev-cluster \
            --service schema-dev-service \
            --force-new-deployment
```

### 7. トラブルシューティング

#### タスクが起動しない場合

```bash
# タスクの停止理由を確認
aws ecs describe-tasks \
  --cluster schema-dev-cluster \
  --tasks <TASK_ARN> \
  --query 'tasks[0].stopCode'

# CloudWatch Logsを確認
aws logs tail /ecs/schema-dev --follow --since 10m
```

**チェックポイント:**
- ECRイメージが存在するか
- イメージのアーキテクチャがARM64か
- タスク定義のCPU/メモリが適切か
- Secrets Managerのシークレットが存在するか
- セキュリティグループの設定が正しいか

#### データベースに接続できない場合

```bash
# セキュリティグループの確認
aws ec2 describe-security-groups \
  --filters Name=tag:Name,Values=schema-dev-ecs-tasks-sg

# RDSエンドポイントの確認
aws rds describe-db-instances \
  --db-instance-identifier schema-dev-db
```

**チェックポイント:**
- ECSセキュリティグループからRDSへの5432ポートが開いているか
- DATABASE_URL環境変数が正しく設定されているか
- RDSがプライベートサブネットにあるか

#### ヘルスチェックが失敗する場合

```bash
# ターゲットグループのヘルスチェック状態を確認
aws elbv2 describe-target-health \
  --target-group-arn <TARGET_GROUP_ARN>
```

**チェックポイント:**
- Next.jsアプリが正しくポート3000でリッスンしているか
- ヘルスチェックパス `/` が200を返すか
- セキュリティグループでALBからECSへの通信が許可されているか

## 開発コマンド

### ビルド

```bash
# 全体のビルド（Prisma生成 + Next.jsビルド）
pnpm build

# webアプリのビルド
pnpm --filter web build
```

### Lint & Format

```bash
# webのLint
pnpm --filter web lint

# 自動修正
pnpm --filter web lint:fix

# フォーマット
pnpm --filter web format
```

### データベース操作

```bash
# Prisma Client生成
pnpm --filter database db:generate

# マイグレーション適用
pnpm --filter database db:deploy

# Prisma Studio起動
pnpm studio
```

## インフラストラクチャ詳細

インフラストラクチャの詳細については、[infrastructure/README.md](./infrastructure/README.md) を参照してください。

主な特徴:
- **マルチAZ構成**: 高可用性設計（2つのAZ）
- **ARM64対応**: ECS FargateでARM64を使用（約20%のコスト削減）
- **セキュリティ**: プライベートサブネットでのECS/RDS配置、Secrets Manager使用
- **自動スケーリング**: ALBとECSサービスによるローリングアップデート
- **モニタリング**: CloudWatch Logs、Container Insights有効化
- **SSL/TLS**: ACMによる証明書の自動管理

## ライセンス

MIT
