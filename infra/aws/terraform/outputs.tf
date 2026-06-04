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

output "app_security_group_id" {
  value       = aws_security_group.app.id
  description = "Security group attached to the app task ENI."
}

