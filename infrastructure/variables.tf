# General Variables
variable "environment" {
  description = "Environment name (e.g., dev, stg, prd)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

# VPC Variables
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# DNS Variables
variable "domain_name" {
  description = "Route53 hosted zone domain name"
  type        = string
}

# RDS Parameter Group Variables
variable "db_parameter_group_family" {
  description = "RDS parameter group family"
  type        = string
  default     = "postgres17"
}

# RDS Variables
variable "db_engine" {
  description = "Database engine type"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "17.6"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Database port"
  type        = number
  sensitive   = true
  default     = 5432
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

# ECR Variables
variable "ecr_repository_name" {
  description = "ECR repository name"
  type        = string
}


# ECS Variables
variable "ecs_task_cpu" {
  description = "CPU units for ECS task"
  type        = string
  default     = "256"
}

variable "ecs_task_memory" {
  description = "Memory for ECS task in MB"
  type        = string
  default     = "512"
}

variable "ecs_image_tag" {
  description = "Docker image tag for the application"
  type        = string
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 3000
}

variable "app_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 2
}

variable "health_check_path" {
  description = "Health check path for ALB"
  type        = string
  default     = "/health"
}


# CRM App Environment Variables
variable "crm_firebase_client_email" {
  description = "CRM Firebase client email"
  type        = string
  sensitive   = true
}

variable "crm_firebase_private_key" {
  description = "CRM Firebase private key"
  type        = string
  sensitive   = true
}

variable "crm_firebase_project_id" {
  description = "CRM Firebase project ID"
  type        = string
  sensitive   = true
}

variable "crm_google_client_id" {
  description = "CRM Google client ID"
  type        = string
  sensitive   = true
}

variable "crm_google_client_secret" {
  description = "CRM Google client secret"
  type        = string
  sensitive   = true
}

variable "crm_next_public_firebase_api_key" {
  description = "CRM Next.js public Firebase API key"
  type        = string
  sensitive   = true
}

variable "crm_next_public_firebase_auth_domain" {
  description = "CRM Next.js public Firebase auth domain"
  type        = string
  sensitive   = true
}

variable "crm_next_public_firebase_project_id" {
  description = "CRM Next.js public Firebase project ID"
  type        = string
  sensitive   = true
}

variable "crm_resend_api_key" {
  description = "CRM Resend API key"
  type        = string
  sensitive   = true
}

