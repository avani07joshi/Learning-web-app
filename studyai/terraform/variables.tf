variable "app_name" {
  default = "studyai"
}

variable "environment" {
  default = "local"
}

variable "db_password" {
  default   = "studyai_pass"
  sensitive = true
}

variable "jwt_secret" {
  sensitive = true
}

variable "anthropic_api_key" {
  sensitive = true
}
