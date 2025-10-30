terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# EC2 Instance
resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  root_block_device {
    volume_size = var.root_volume_size
  }

  tags = {
    Name        = "web-server"
    Environment = var.environment
    Service     = "web"
  }
}

# RDS Instance
resource "aws_db_instance" "postgres" {
  identifier           = "app-db-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_storage_gb
  storage_type         = "gp3"
  db_name              = "appdb"
  username             = "dbadmin"
  password             = "changeme123!"
  skip_final_snapshot  = true
  publicly_accessible  = false

  tags = {
    Name        = "app-database"
    Environment = var.environment
    Service     = "database"
  }
}

# S3 Bucket
resource "aws_s3_bucket" "app_data" {
  bucket = "app-data-${var.environment}-${var.region}"

  tags = {
    Name        = "app-data"
    Environment = var.environment
    Service     = "storage"
  }
}

# S3 Bucket Storage (estimate)
resource "aws_s3_bucket_lifecycle_configuration" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}

# Application Load Balancer
resource "aws_lb" "app" {
  name               = "app-lb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  subnets            = ["subnet-12345678", "subnet-87654321"]

  tags = {
    Name        = "app-load-balancer"
    Environment = var.environment
    Service     = "networking"
  }
}

# NAT Gateway (expensive!)
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name        = "nat-gateway-eip"
    Environment = var.environment
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = "subnet-12345678"

  tags = {
    Name        = "main-nat-gateway"
    Environment = var.environment
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "app-cache-${var.environment}"
  engine               = "redis"
  node_type            = var.cache_node_type
  num_cache_nodes      = var.cache_node_count
  parameter_group_name = "default.redis7"
  port                 = 6379

  tags = {
    Name        = "app-cache"
    Environment = var.environment
    Service     = "cache"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/app/${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "app-logs"
    Environment = var.environment
  }
}
