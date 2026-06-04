output "ecr_repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "Push the app image here before updating the ECS service."
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.app.name
  description = "ECS cluster running the portfolio demo."
}

output "ecs_service_name" {
  value       = aws_ecs_service.app.name
  description = "ECS service for the Next.js app."
}

output "app_url" {
  value       = "http://${aws_lb.app.dns_name}"
  description = "HTTP URL for the application load balancer."
}

output "app_security_group_id" {
  value       = aws_security_group.app.id
  description = "Security group attached to the app task ENI."
}

output "database_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS PostgreSQL endpoint for the persisted RAG document store."
}

output "database_url_secret_arn" {
  value       = local.database_url_secret_arn
  description = "Secrets Manager ARN used by ECS tasks for DATABASE_URL."
}

output "seed_task_family" {
  value       = aws_ecs_task_definition.seed.family
  description = "ECS task family for one-shot TypeORM migration and seed runs."
}
