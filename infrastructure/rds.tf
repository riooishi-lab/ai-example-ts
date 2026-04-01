resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-db-params"
  family = var.db_parameter_group_family

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }
  parameter {
    name         = "client_encoding"
    value        = "UTF8"
    apply_method = "immediate"
  }
  parameter {
    name         = "max_wal_size"
    value        = "2048"
    apply_method = "immediate"
  }
  parameter {
    # slow query
    name         = "log_min_duration_statement"
    value        = "1000"
    apply_method = "immediate"
  }
  parameter {
    name         = "deadlock_timeout"
    value        = "30000"
    apply_method = "immediate"
  }
  parameter {
    name         = "timezone"
    value        = "Asia/Tokyo"
    apply_method = "immediate"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  engine         = var.db_engine
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  port     = var.db_port
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  multi_az                = var.db_multi_az
  publicly_accessible     = false
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  skip_final_snapshot       = var.environment != "prd"
  final_snapshot_identifier = var.environment == "prd" ? "${var.project_name}-${var.environment}-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "${var.project_name}-${var.environment}-db"
  }
}
