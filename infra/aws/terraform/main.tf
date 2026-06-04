terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  app_name                = "cre-knowledge-graph-ai"
  container_image         = var.container_image != "" ? var.container_image : "${aws_ecr_repository.app.repository_url}:latest"
  database_name           = "cre_kg"
  database_username       = "creadmin"
  database_url            = "postgres://${local.database_username}:${random_password.database.result}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/${local.database_name}"
  database_url_secret_arn = var.database_url_secret_arn != "" ? var.database_url_secret_arn : aws_secretsmanager_secret.database_url.arn
  task_secret_arns        = compact([local.database_url_secret_arn, var.neo4j_password_secret_arn])
}

resource "aws_ecr_repository" "app" {
  name                 = local.app_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${local.app_name}"
  retention_in_days = 14
}

resource "random_password" "database" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "database_url" {
  name        = "${local.app_name}/database-url"
  description = "DATABASE_URL for the CRE knowledge graph RDS PostgreSQL instance."
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = local.database_url
}

resource "aws_ecs_cluster" "app" {
  name = local.app_name
}

resource "aws_iam_role" "task_execution" {
  name = "${local.app_name}-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_execution_secrets" {
  name = "${local.app_name}-secrets"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = local.task_secret_arns
      }
    ]
  })
}

resource "aws_security_group" "load_balancer" {
  name        = "${local.app_name}-alb"
  description = "Allow HTTP access to the portfolio demo load balancer."
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_ingress_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "app" {
  name        = "${local.app_name}-app"
  description = "Allow ALB traffic to the portfolio demo app."
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.load_balancer.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "database" {
  name        = "${local.app_name}-db"
  description = "Allow Postgres access only from ECS tasks."
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "postgres" {
  name       = local.app_name
  subnet_ids = var.database_subnet_ids
}

resource "aws_db_instance" "postgres" {
  identifier             = local.app_name
  allocated_storage      = var.database_allocated_storage
  db_name                = local.database_name
  engine                 = "postgres"
  engine_version         = var.postgres_engine_version
  instance_class         = var.database_instance_class
  username               = local.database_username
  password               = random_password.database.result
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.database.id]
  publicly_accessible    = false
  skip_final_snapshot    = var.database_skip_final_snapshot
  deletion_protection    = var.database_deletion_protection
  storage_encrypted      = true
}

resource "aws_lb" "app" {
  name               = local.app_name
  load_balancer_type = "application"
  security_groups    = [aws_security_group.load_balancer.id]
  subnets            = var.public_subnet_ids
}

resource "aws_lb_target_group" "app" {
  name        = local.app_name
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = "/api/health"
    matcher             = "200"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = local.app_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = local.container_image
      essential = true
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NEO4J_URI"
          value = var.neo4j_uri
        },
        {
          name  = "NEO4J_USERNAME"
          value = var.neo4j_username
        },
        {
          name  = "RAG_TOP_K"
          value = tostring(var.rag_top_k)
        }
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = local.database_url_secret_arn
        },
        {
          name      = "NEO4J_PASSWORD"
          valueFrom = var.neo4j_password_secret_arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "app"
        }
      }
    }
  ])

  depends_on = [aws_secretsmanager_secret_version.database_url]
}

resource "aws_ecs_task_definition" "seed" {
  family                   = "${local.app_name}-seed"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.seed_task_cpu
  memory                   = var.seed_task_memory
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "seed"
      image     = local.container_image
      essential = true
      command   = ["npm", "run", "db:seed"]
      environment = [
        {
          name  = "NEO4J_URI"
          value = var.neo4j_uri
        },
        {
          name  = "NEO4J_USERNAME"
          value = var.neo4j_username
        }
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = local.database_url_secret_arn
        },
        {
          name      = "NEO4J_PASSWORD"
          valueFrom = var.neo4j_password_secret_arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "seed"
        }
      }
    }
  ])

  depends_on = [aws_secretsmanager_secret_version.database_url]
}

resource "aws_ecs_service" "app" {
  name            = local.app_name
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 3000
  }

  network_configuration {
    assign_public_ip = true
    security_groups  = [aws_security_group.app.id]
    subnets          = var.app_subnet_ids
  }

  depends_on = [aws_lb_listener.http]
}
