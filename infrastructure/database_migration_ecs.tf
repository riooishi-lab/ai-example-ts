####################################################
# ECS IAM Role
####################################################
data "aws_iam_policy_document" "migration_ecs_task_execution_assume_policy" {
  version = "2012-10-17"
  statement {
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
  }
}

resource "aws_iam_role" "migration_ecs_task_execution" {
  name               = "${var.project_name}-${var.environment}-migration-ecs-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.migration_ecs_task_execution_assume_policy.json

  tags = {
    Name = "${var.project_name}-${var.environment}-migration-ecs-task-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "migration_ecs_task_execution" {
  role       = aws_iam_role.migration_ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "migration_ecs_task_execution_secret_value_policy" {
  version = "2012-10-17"
  statement {
    resources = [aws_secretsmanager_secret.db_url.arn]
    actions   = ["secretsmanager:GetSecretValue"]
    effect    = "Allow"
  }
}

resource "aws_iam_role_policy" "migration_ecs_task_execution_secrets" {
  name   = "${var.project_name}-${var.environment}-migration-ecs-secrets-policy"
  role   = aws_iam_role.migration_ecs_task_execution.id
  policy = data.aws_iam_policy_document.migration_ecs_task_execution_secret_value_policy.json
}

####################################################
# ECR Repository
####################################################
resource "aws_ecr_repository" "migration_ecr" {
  name = "${var.ecr_repository_name}-${var.environment}-migration"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.ecr_repository_name}-${var.environment}-migration"
  }
}

####################################################
# ECS Task
####################################################
resource "aws_cloudwatch_log_group" "migration" {
  name              = "/ecs/${var.project_name}-${var.environment}-migration"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-migration-logs"
  }
}

resource "aws_ecs_task_definition" "migration" {
  family                   = "${var.project_name}-${var.environment}-migration-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.migration_ecs_task_execution.arn
  task_role_arn            = aws_iam_role.migration_ecs_task_execution.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name  = "${var.project_name}-migration"
      image = "${aws_ecr_repository.migration_ecr.repository_url}:${var.ecs_image_tag}"

      environment = [
        {
          name  = "PORT"
          value = tostring(var.app_port)
        },
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.db_url.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.migration.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs-migration"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-app-task"
  }
}

resource "null_resource" "migration" {
  triggers = {
    task_definition_arn = aws_ecs_task_definition.migration.arn
    # updated_at          = timestamp()
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws ecs run-task \
        --cluster ${aws_ecs_cluster.app.id} \
        --task-definition ${aws_ecs_task_definition.migration.arn} \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${join(",", aws_subnet.private[*].id)}],securityGroups=[${aws_security_group.ecs_tasks.id}],assignPublicIp=DISABLED}" \
        --region ${var.aws_region}
    EOT
  }

  depends_on = [aws_ecs_task_definition.migration]
}
