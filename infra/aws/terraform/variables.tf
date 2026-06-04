variable "aws_region" {
  type        = string
  description = "AWS region for ECS resources."
  default     = "us-east-1"
}

variable "container_image" {
  type        = string
  description = "Optional prebuilt image URI. Defaults to this stack's ECR repo with latest tag."
  default     = ""
}

variable "vpc_id" {
  type        = string
  description = "VPC id for the ECS service security group."
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet ids for the application load balancer."
}

variable "app_subnet_ids" {
  type        = list(string)
  description = "Subnet ids for the ECS Fargate service. Public subnets are acceptable for the demo; private subnets with NAT are preferred for production."
}

variable "database_subnet_ids" {
  type        = list(string)
  description = "Private subnet ids for the RDS PostgreSQL subnet group."
}

variable "allowed_ingress_cidrs" {
  type        = list(string)
  description = "CIDR blocks allowed to reach the demo container on port 3000."
  default     = ["0.0.0.0/0"]
}

variable "database_url_secret_arn" {
  type        = string
  description = "Optional Secrets Manager ARN to use for DATABASE_URL instead of the Terraform-managed RDS secret. RDS is still provisioned by this module."
  default     = ""
}

variable "neo4j_password_secret_arn" {
  type        = string
  description = "Secrets Manager ARN containing NEO4J_PASSWORD."
}

variable "neo4j_uri" {
  type        = string
  description = "Neo4j Bolt URI or compatible graph endpoint URI."
}

variable "neo4j_username" {
  type        = string
  description = "Neo4j username."
  default     = "neo4j"
}

variable "rag_top_k" {
  type        = number
  description = "Number of retrieved chunks to include in RAG answers."
  default     = 4
}

variable "embedding_provider" {
  type        = string
  description = "Embedding provider for ECS tasks. Use deterministic for offline demos or http for a managed embedding endpoint."
  default     = "deterministic"
}

variable "embedding_api_url" {
  type        = string
  description = "HTTP embedding provider endpoint. Required when embedding_provider is http."
  default     = ""
}

variable "embedding_api_key_secret_arn" {
  type        = string
  description = "Optional Secrets Manager ARN containing EMBEDDING_API_KEY."
  default     = ""
}

variable "embedding_model" {
  type        = string
  description = "Optional embedding model name sent to the HTTP embedding provider."
  default     = ""
}

variable "embedding_response_path" {
  type        = string
  description = "Dot path to the embedding array in the HTTP provider response, for example embedding or data.0.embedding."
  default     = "embedding"
}

variable "task_cpu" {
  type        = number
  description = "Fargate task CPU units."
  default     = 512
}

variable "task_memory" {
  type        = number
  description = "Fargate task memory in MiB."
  default     = 1024
}

variable "desired_count" {
  type        = number
  description = "Number of running app tasks."
  default     = 1
}

variable "postgres_engine_version" {
  type        = string
  description = "RDS PostgreSQL engine version."
  default     = "16.6"
}

variable "database_instance_class" {
  type        = string
  description = "RDS PostgreSQL instance class."
  default     = "db.t4g.micro"
}

variable "database_allocated_storage" {
  type        = number
  description = "Allocated RDS storage in GiB."
  default     = 20
}

variable "database_deletion_protection" {
  type        = bool
  description = "Protect the RDS instance from accidental deletion."
  default     = true
}

variable "database_skip_final_snapshot" {
  type        = bool
  description = "Skip final RDS snapshots on destroy. Keep false for production, true for ephemeral CI/demo stacks."
  default     = false
}

variable "seed_task_cpu" {
  type        = number
  description = "Fargate CPU units for the one-shot migration and seed task."
  default     = 512
}

variable "seed_task_memory" {
  type        = number
  description = "Fargate memory in MiB for the one-shot migration and seed task."
  default     = 1024
}
