# PdfDing Makefile
# Makefile for building and running the PdfDing application with Docker

.PHONY: help build run up down stop restart logs clean rebuild shell test migrate collectstatic dev

# Default target
.DEFAULT_GOAL := help

# Docker and compose settings
DOCKER_IMAGE := pdfding:custom
COMPOSE_FILE := compose/sqlite.docker-compose.yaml
CONTAINER_NAME := pdfding

# Environment variables (can be overridden)
SECRET_KEY ?= your-very-long-secret-key-change-this-in-production
HOST_NAME ?= pdf.hesko.space
ALLOWED_HOSTS ?= 127.0.0.1,localhost,pdf.hesko.space,pdf.hesko.ai
DEFAULT_THEME ?= dark
DEFAULT_THEME_COLOR ?= blue
CSRF_COOKIE_SECURE ?= FALSE
SESSION_COOKIE_SECURE ?= FALSE

# Docker build options
USE_BUILDKIT ?= 0
DOCKER_BUILD_OPTS = 
ifeq ($(USE_BUILDKIT),1)
    DOCKER_BUILD_OPTS = DOCKER_BUILDKIT=1
endif

## help: Show this help message
help:
	@echo "PdfDing Development Makefile"
	@echo ""
	@echo "Available targets:"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'
	@echo ""
	@echo "Environment variables (with defaults):"
	@echo "  SECRET_KEY='$(SECRET_KEY)'"
	@echo "  HOST_NAME='$(HOST_NAME)'"
	@echo "  ALLOWED_HOSTS='$(ALLOWED_HOSTS)'"
	@echo "  DEFAULT_THEME='$(DEFAULT_THEME)'"
	@echo "  DEFAULT_THEME_COLOR='$(DEFAULT_THEME_COLOR)'"
	@echo "  CSRF_COOKIE_SECURE='$(CSRF_COOKIE_SECURE)'"
	@echo "  SESSION_COOKIE_SECURE='$(SESSION_COOKIE_SECURE)'"
	@echo "  USE_BUILDKIT='$(USE_BUILDKIT)' (set to 1 to enable Docker BuildKit)"
	@echo ""
	@echo "For build troubleshooting, see docker-build-guide.md"
	@echo "For host configuration help, see host-configuration-guide.md"

## build: Build the Docker image
build:
	@echo "Building Docker image: $(DOCKER_IMAGE)"
	$(DOCKER_BUILD_OPTS) docker build -t $(DOCKER_IMAGE) .

## build-buildkit: Build the Docker image with BuildKit enabled
build-buildkit:
	@echo "Building Docker image with BuildKit: $(DOCKER_IMAGE)"
	DOCKER_BUILDKIT=1 docker build -t $(DOCKER_IMAGE) .

## run: Build and run the application using docker-compose
run: build
	@echo "Starting PdfDing application..."
	SECRET_KEY=$(SECRET_KEY) \
	HOST_NAME=$(HOST_NAME) \
	ALLOWED_HOSTS=$(ALLOWED_HOSTS) \
	DEFAULT_THEME=$(DEFAULT_THEME) \
	DEFAULT_THEME_COLOR=$(DEFAULT_THEME_COLOR) \
	CSRF_COOKIE_SECURE=$(CSRF_COOKIE_SECURE) \
	SESSION_COOKIE_SECURE=$(SESSION_COOKIE_SECURE) \
	docker compose -f $(COMPOSE_FILE) up -d

## up: Start the application (without building)
up:
	@echo "Starting PdfDing application..."
	SECRET_KEY=$(SECRET_KEY) \
	HOST_NAME=$(HOST_NAME) \
	ALLOWED_HOSTS=$(ALLOWED_HOSTS) \
	DEFAULT_THEME=$(DEFAULT_THEME) \
	DEFAULT_THEME_COLOR=$(DEFAULT_THEME_COLOR) \
	CSRF_COOKIE_SECURE=$(CSRF_COOKIE_SECURE) \
	SESSION_COOKIE_SECURE=$(SESSION_COOKIE_SECURE) \
	docker compose -f $(COMPOSE_FILE) up -d

## down: Stop and remove containers, networks
down:
	@echo "Stopping PdfDing application..."
	docker compose -f $(COMPOSE_FILE) down

## stop: Stop the running containers
stop:
	@echo "Stopping containers..."
	docker compose -f $(COMPOSE_FILE) stop

## restart: Restart the application
restart: stop up

## logs: Show application logs
logs:
	docker compose -f $(COMPOSE_FILE) logs -f

## clean: Stop containers and remove images, volumes (WARNING: This removes all data!)
clean:
	@echo "WARNING: This will remove all containers, images, and volumes!"
	@read -p "Are you sure? [y/N]: " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose -f $(COMPOSE_FILE) down -v --rmi all
	docker system prune -f

## rebuild: Clean build and run
rebuild: clean build run

## shell: Open a shell in the running container
shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh

## shell-build: Open a shell in a temporary container for debugging build issues
shell-build:
	docker run --rm -it $(DOCKER_IMAGE) /bin/sh

## migrate: Run Django migrations inside the container
migrate:
	docker exec -it $(CONTAINER_NAME) python pdfding/manage.py migrate

## migrate-make: Create new Django migrations inside the container
migrate-make:
	docker exec -it $(CONTAINER_NAME) python pdfding/manage.py makemigrations

## collectstatic: Collect static files inside the container
collectstatic:
	docker exec -it $(CONTAINER_NAME) python pdfding/manage.py collectstatic --noinput

## createsuperuser: Create a Django superuser inside the container
createsuperuser:
	docker exec -it $(CONTAINER_NAME) python pdfding/manage.py createsuperuser

## test: Run tests inside the container
test:
	docker exec -it $(CONTAINER_NAME) python pdfding/manage.py test

## local: Start application for local development (127.0.0.1)
local:
	@echo "Starting PdfDing for local development..."
	SECRET_KEY=$(SECRET_KEY) \
	HOST_NAME=127.0.0.1 \
	ALLOWED_HOSTS=127.0.0.1,localhost \
	DEFAULT_THEME=$(DEFAULT_THEME) \
	DEFAULT_THEME_COLOR=$(DEFAULT_THEME_COLOR) \
	CSRF_COOKIE_SECURE=FALSE \
	SESSION_COOKIE_SECURE=FALSE \
	$(MAKE) build && \
	docker compose -f $(COMPOSE_FILE) up -d

## dev: Start development environment with bind mounts for live code editing
dev:
	@echo "Starting development environment with live code editing..."
	@echo "Note: This mounts the local codebase for development"
	SECRET_KEY=$(SECRET_KEY) \
	HOST_NAME=$(HOST_NAME) \
	ALLOWED_HOSTS=$(ALLOWED_HOSTS) \
	DEFAULT_THEME=$(DEFAULT_THEME) \
	DEFAULT_THEME_COLOR=$(DEFAULT_THEME_COLOR) \
	CSRF_COOKIE_SECURE=$(CSRF_COOKIE_SECURE) \
	SESSION_COOKIE_SECURE=$(SESSION_COOKIE_SECURE) \
	docker run --rm -it \
		-p 8000:8000 \
		-v $(PWD)/pdfding:/home/nonroot/pdfding \
		-v sqlite_data:/home/nonroot/pdfding/db \
		-v media:/home/nonroot/pdfding/media \
		-e SECRET_KEY=$(SECRET_KEY) \
		-e HOST_NAME=$(HOST_NAME) \
		-e ALLOWED_HOSTS=$(ALLOWED_HOSTS) \
		-e DEFAULT_THEME=$(DEFAULT_THEME) \
		-e DEFAULT_THEME_COLOR=$(DEFAULT_THEME_COLOR) \
		-e CSRF_COOKIE_SECURE=$(CSRF_COOKIE_SECURE) \
		-e SESSION_COOKIE_SECURE=$(SESSION_COOKIE_SECURE) \
		--name $(CONTAINER_NAME)-dev \
		$(DOCKER_IMAGE)

## status: Show status of containers
status:
	docker compose -f $(COMPOSE_FILE) ps

## images: List Docker images
images:
	docker images | grep -E "(pdfding|REPOSITORY)"

## volumes: List Docker volumes
volumes:
	docker volume ls | grep -E "(sqlite_data|media|DRIVER)"

## backup: Create a backup of the database and media files
backup:
	@echo "Creating backup..."
	@mkdir -p backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S) && \
	docker run --rm \
		-v sqlite_data:/data/db \
		-v media:/data/media \
		-v $(PWD)/backups:/backup \
		alpine:latest \
		sh -c "cd /data && tar czf /backup/pdfding_backup_$$TIMESTAMP.tar.gz db media" && \
	echo "Backup created: backups/pdfding_backup_$$TIMESTAMP.tar.gz"

## restore: Restore from a backup (usage: make restore BACKUP_FILE=backup_file.tar.gz)
restore:
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "Error: Please specify BACKUP_FILE=your_backup_file.tar.gz"; \
		exit 1; \
	fi
	@if [ ! -f "backups/$(BACKUP_FILE)" ]; then \
		echo "Error: Backup file backups/$(BACKUP_FILE) not found"; \
		exit 1; \
	fi
	@echo "WARNING: This will overwrite all existing data!"
	@read -p "Are you sure you want to restore from backups/$(BACKUP_FILE)? [y/N]: " confirm && [ "$$confirm" = "y" ] || exit 1
	docker run --rm \
		-v sqlite_data:/data/db \
		-v media:/data/media \
		-v $(PWD)/backups:/backup \
		alpine:latest \
		sh -c "cd /data && tar xzf /backup/$(BACKUP_FILE)"
	@echo "Restore completed from backups/$(BACKUP_FILE)"

## update: Pull latest changes and rebuild
update:
	@echo "Updating PdfDing..."
	git pull
	$(MAKE) rebuild

## production: Deploy in production mode with proper security settings
production:
	@echo "Deploying in production mode..."
	@if [ "$(SECRET_KEY)" = "your-very-long-secret-key-change-this-in-production" ]; then \
		echo "ERROR: Please set a proper SECRET_KEY for production!"; \
		exit 1; \
	fi
	@if [ "$(HOST_NAME)" = "127.0.0.1" ] || [ "$(HOST_NAME)" = "localhost" ]; then \
		echo "ERROR: Please set a proper HOST_NAME for production (not localhost/127.0.0.1)!"; \
		exit 1; \
	fi
	SECRET_KEY=$(SECRET_KEY) \
	HOST_NAME=$(HOST_NAME) \
	ALLOWED_HOSTS=$(ALLOWED_HOSTS) \
	DEFAULT_THEME=$(DEFAULT_THEME) \
	DEFAULT_THEME_COLOR=$(DEFAULT_THEME_COLOR) \
	CSRF_COOKIE_SECURE=TRUE \
	SESSION_COOKIE_SECURE=TRUE \
	$(MAKE) run