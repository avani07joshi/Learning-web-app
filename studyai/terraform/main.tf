terraform {
  required_version = ">= 1.5"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "studyai_net" {
  name = "${var.app_name}_network"
}

resource "docker_volume" "postgres_data" {
  name = "${var.app_name}_postgres_data"
}

resource "docker_volume" "grafana_data" {
  name = "${var.app_name}_grafana_data"
}

resource "docker_volume" "uploads_data" {
  name = "${var.app_name}_uploads_data"
}

resource "docker_container" "db" {
  name  = "${var.app_name}_db"
  image = "postgres:16-alpine"
  networks_advanced { name = docker_network.studyai_net.name }
  env = [
    "POSTGRES_USER=studyai",
    "POSTGRES_PASSWORD=${var.db_password}",
    "POSTGRES_DB=studyai",
  ]
  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }
  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U studyai"]
    interval = "5s"
    timeout  = "5s"
    retries  = 5
  }
}

resource "docker_container" "backend" {
  name  = "${var.app_name}_backend"
  image = "studyai-backend:latest"
  networks_advanced { name = docker_network.studyai_net.name }
  env = [
    "DATABASE_URL=postgresql://studyai:${var.db_password}@${var.app_name}_db:5432/studyai",
    "JWT_SECRET=${var.jwt_secret}",
    "JWT_ALGORITHM=HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES=10080",
    "ANTHROPIC_API_KEY=${var.anthropic_api_key}",
    "FRONTEND_URL=http://localhost:80",
  ]
  volumes {
    volume_name    = docker_volume.uploads_data.name
    container_path = "/app/uploads"
  }
  depends_on = [docker_container.db]
}

resource "docker_container" "frontend" {
  name  = "${var.app_name}_frontend"
  image = "studyai-frontend:latest"
  networks_advanced { name = docker_network.studyai_net.name }
  depends_on = [docker_container.backend]
}

resource "docker_container" "nginx" {
  name  = "${var.app_name}_nginx"
  image = "nginx:alpine"
  networks_advanced { name = docker_network.studyai_net.name }
  ports {
    internal = 80
    external = 80
  }
  volumes {
    host_path      = "${path.module}/../nginx/nginx.conf"
    container_path = "/etc/nginx/conf.d/default.conf"
  }
  depends_on = [docker_container.frontend, docker_container.backend]
}

resource "docker_container" "prometheus" {
  name  = "${var.app_name}_prometheus"
  image = "prom/prometheus:latest"
  networks_advanced { name = docker_network.studyai_net.name }
  command = [
    "--config.file=/etc/prometheus/prometheus.yml",
    "--storage.tsdb.retention.time=7d",
  ]
  volumes {
    host_path      = "${path.module}/../monitoring/prometheus.yml"
    container_path = "/etc/prometheus/prometheus.yml"
  }
}

resource "docker_container" "grafana" {
  name  = "${var.app_name}_grafana"
  image = "grafana/grafana:latest"
  networks_advanced { name = docker_network.studyai_net.name }
  ports {
    internal = 3000
    external = 3000
  }
  env = [
    "GF_SECURITY_ADMIN_PASSWORD=studyai123",
    "GF_USERS_ALLOW_SIGN_UP=false",
  ]
  volumes {
    volume_name    = docker_volume.grafana_data.name
    container_path = "/var/lib/grafana"
  }
  volumes {
    host_path      = "${path.module}/../monitoring/grafana/provisioning"
    container_path = "/etc/grafana/provisioning"
  }
  volumes {
    host_path      = "${path.module}/../monitoring/grafana/dashboards"
    container_path = "/var/lib/grafana/dashboards"
  }
  depends_on = [docker_container.prometheus]
}
