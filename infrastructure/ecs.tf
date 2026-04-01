####################################################
# ECS IAM Role
####################################################
data "aws_iam_policy_document" "ecs_task_execution_assume_policy" {
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

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${var.project_name}-${var.environment}-ecs-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_assume_policy.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "ecs_task_execution_secret_value_policy" {
  version = "2012-10-17"
  statement {
    resources = [
      aws_secretsmanager_secret.db_url.arn,
      aws_secretsmanager_secret.crm_app_secrets.arn,
    ]
    actions = ["secretsmanager:GetSecretValue"]
    effect  = "Allow"
  }
}

resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name   = "${var.project_name}-${var.environment}-ecs-secrets-policy"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.ecs_task_execution_secret_value_policy.json
}

####################################################
# ECR Repository
####################################################
resource "aws_ecr_repository" "ecr" {
  name = "${var.ecr_repository_name}-${var.environment}"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.ecr_repository_name}-${var.environment}"
  }
}

####################################################
# ECS Cluster and Service
####################################################
resource "aws_ecs_cluster" "app" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-logs"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-${var.environment}-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_execution.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name  = "${var.project_name}-app"
      image = "${aws_ecr_repository.ecr.repository_url}:${var.ecs_image_tag}"

      portMappings = [
        {
          containerPort = var.app_port
          protocol      = "tcp"
        }
      ]

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
        },
        {
          name      = "APP_URL"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:APP_URL::"
        },
        {
          name      = "FIREBASE_CLIENT_EMAIL"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:FIREBASE_CLIENT_EMAIL::"
        },
        {
          name      = "FIREBASE_PRIVATE_KEY"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:FIREBASE_PRIVATE_KEY::"
        },
        {
          name      = "FIREBASE_PROJECT_ID"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:FIREBASE_PROJECT_ID::"
        },
        {
          name      = "GOOGLE_CLIENT_ID"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:GOOGLE_CLIENT_ID::"
        },
        {
          name      = "GOOGLE_CLIENT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:GOOGLE_CLIENT_SECRET::"
        },
        {
          name      = "NEXT_PUBLIC_FIREBASE_API_KEY"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:NEXT_PUBLIC_FIREBASE_API_KEY::"
        },
        {
          name      = "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN::"
        },
        {
          name      = "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:NEXT_PUBLIC_FIREBASE_PROJECT_ID::"
        },
        {
          name      = "RESEND_API_KEY"
          valueFrom = "${aws_secretsmanager_secret.crm_app_secrets.arn}:RESEND_API_KEY::"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-app-task"
  }
}

resource "aws_lb" "app" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "prd"

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-${var.environment}-tg"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-tg"
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2015-05"
  certificate_arn   = aws_acm_certificate.cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

resource "aws_lb_listener_rule" "connection_upgrade" {
  listener_arn = aws_lb_listener.https.arn
  action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "HEALTHY"
      status_code  = "200"
    }
  }

  condition {
    http_header {
      http_header_name = "Connection"
      values           = ["upgrade", "Upgrade"]
    }
  }
}

resource "aws_ecs_service" "app" {
  name                               = "${var.project_name}-${var.environment}-service"
  cluster                            = aws_ecs_cluster.app.id
  task_definition                    = aws_ecs_task_definition.app.arn
  desired_count                      = var.app_count
  launch_type                        = "FARGATE"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  propagate_tags                     = "SERVICE"
  enable_execute_command             = true
  health_check_grace_period_seconds  = 60
  wait_for_steady_state              = true
  force_new_deployment               = true

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "${var.project_name}-app"
    container_port   = var.app_port
  }

  depends_on = [aws_lb_listener.https]

  tags = {
    Name = "${var.project_name}-${var.environment}-service"
  }
}

####################################################
# Secrets Manager
####################################################
resource "aws_secretsmanager_secret" "db_url" {
  name                    = "${var.project_name}-${var.environment}-db-url"
  recovery_window_in_days = var.environment == "prd" ? 30 : 0

  tags = {
    Name = "${var.project_name}-${var.environment}-db-url"
  }
}

resource "aws_secretsmanager_secret_version" "db_url" {
  secret_id     = aws_secretsmanager_secret.db_url.id
  secret_string = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.address}:${tostring(aws_db_instance.main.port)}/${var.db_name}"
}

resource "aws_secretsmanager_secret" "crm_app_secrets" {
  name                    = "${var.project_name}-${var.environment}-crm-app-secret-json"
  recovery_window_in_days = var.environment == "prd" ? 30 : 0

  tags = {
    Name = "${var.project_name}-${var.environment}-crm-app-secret-json"
  }
}

resource "aws_secretsmanager_secret_version" "crm_app_secrets" {
  secret_id = aws_secretsmanager_secret.crm_app_secrets.id
  secret_string = jsonencode({
    APP_URL                          = "https://${aws_route53_record.app.fqdn}"
    FIREBASE_CLIENT_EMAIL            = var.crm_firebase_client_email
    FIREBASE_PRIVATE_KEY             = var.crm_firebase_private_key
    FIREBASE_PROJECT_ID              = var.crm_firebase_project_id
    GOOGLE_CLIENT_ID                 = var.crm_google_client_id
    GOOGLE_CLIENT_SECRET             = var.crm_google_client_secret
    NEXT_PUBLIC_FIREBASE_API_KEY     = var.crm_next_public_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = var.crm_next_public_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID  = var.crm_next_public_firebase_project_id
    RESEND_API_KEY                   = var.crm_resend_api_key
  })
}
