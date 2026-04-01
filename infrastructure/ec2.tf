# variable "key_pair_name" {
#   description = "Name of the SSH key pair for Bastion Host"
#   type        = string
#   default     = ""
# }

# variable "private_key_path" {
#   description = "Path to the private key file for SSH access to Bastion Host"
#   type        = string
#   default     = ""
# }

# resource "aws_eip" "bastion_eip" {
#   domain = "vpc"
#   tags = {
#     Name = "bastion-host-eip-${var.environment}"
#   }
# }

# resource "aws_security_group" "bastion_sg" {
#   name        = "bastion-sg-${var.environment}"
#   description = "Allow SSH from local IP and outbound to all"
#   vpc_id      = aws_vpc.main.id

#   ingress {
#     description = "Allow SSH from specific local IP"
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = [for subnet in aws_subnet.public : subnet.cidr_block]
#   }

#   ingress {
#     description = "Allow SSH from specific local IP"
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   egress {
#     from_port   = 0
#     to_port     = var.db_port
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   tags = {
#     Name = "bastion-sg-${var.environment}"
#   }
# }

# resource "aws_vpc_security_group_ingress_rule" "bastion_to_rds" {
#   security_group_id = aws_security_group.rds.id

#   description                  = "Allow DB Port from Bastion Host"
#   referenced_security_group_id = aws_security_group.bastion_sg.id
#   from_port                    = var.db_port
#   ip_protocol                  = "tcp"
#   to_port                      = var.db_port
# }

# data "aws_ami" "al2023" {
#   most_recent = true
#   owners      = ["amazon"]

#   filter {
#     name   = "name"
#     values = ["al2023-ami-2023.*-x86_64"]
#   }
# }

# resource "aws_instance" "bastion_host" {
#   ami                         = data.aws_ami.al2023.id
#   instance_type               = "t3.nano"
#   key_name                    = var.key_pair_name
#   subnet_id                   = aws_subnet.public[0].id
#   associate_public_ip_address = true

#   vpc_security_group_ids = [aws_security_group.bastion_sg.id]

#   tags = {
#     Name = "BastionHost-${var.environment}"
#   }

#   connection {
#     type        = "ssh"
#     user        = "ec2-user" # Default user for Amazon Linux 2023
#     private_key = file(var.private_key_path)
#     host        = self.public_ip
#     timeout     = "5m"
#   }

#   provisioner "remote-exec" {
#     inline = [
#       "echo 'Bastion host deployed successfully.'",
#     ]
#   }
# }

# resource "aws_eip_association" "eip_assoc" {
#   instance_id   = aws_instance.bastion_host.id
#   allocation_id = aws_eip.bastion_eip.id
# }
