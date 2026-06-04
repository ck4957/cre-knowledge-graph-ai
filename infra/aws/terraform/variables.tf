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

variable "subnet_ids" {
  type        = list(string)
  description = "Subnet ids for the ECS Fargate service."
}

variable "allowed_ingress_cidrs" {
  type        = list(string)
  description = "CIDR blocks allowed to reach the demo container on port 3000."
  default     = ["0.0.0.0/0"]
}

variable "database_url_secret_arn" {
  type        = string
  description = "Secrets Manager ARN containing DATABASE_URL."
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

