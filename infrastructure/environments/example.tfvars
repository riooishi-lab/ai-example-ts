####################################################
# General Configuration
####################################################
environment  = "dev"
project_name = "web-app"
aws_region   = "ap-northeast-1"

####################################################
# VPC Configuration
####################################################
vpc_cidr             = "0.0.0.0/16"
availability_zones   = ["ap-northeast-1a", "ap-northeast-1c"]
public_subnet_cidrs  = ["0.0.0.0/24", "0.0.0.0/24"]
private_subnet_cidrs = ["0.0.0.0/24", "0.0.0.0/24"]

####################################################
# DNS Configuration
####################################################
domain_name = "example.com"

####################################################
# RDS Parameter Group Configuration
####################################################
db_parameter_group_family = "postgres17"

####################################################
# RDS Configuration
####################################################
db_engine            = "postgres"
db_engine_version    = "17.6"
db_instance_class    = "db.t3.micro"
db_name              = "myappdb"
db_username          = "dbadmin"
db_password          = "CHANGE_ME_STRONG_PASSWORD"
db_allocated_storage = 20
db_multi_az          = false

####################################################
# ECR Configuration
####################################################
ecr_repository_name = "web-app-ecr"

####################################################
# ECS Configuration
####################################################
ecs_task_cpu                  = "256"
ecs_task_memory               = "512"
ecs_image_tag                 = "latest"
app_port                      = 3000
app_count                     = 2
health_check_path = "/health"

####################################################
# Environment Variables for CRM App
####################################################
crm_firebase_client_email            = "CHANGE_ME"
crm_firebase_private_key             = "CHANGE_ME"
crm_firebase_project_id              = "CHANGE_ME"
crm_google_client_id                 = "CHANGE_ME"
crm_google_client_secret             = "CHANGE_ME"
crm_next_public_firebase_api_key     = "CHANGE_ME"
crm_next_public_firebase_auth_domain = "CHANGE_ME"
crm_next_public_firebase_project_id  = "CHANGE_ME"
crm_resend_api_key                   = "CHANGE_ME"

