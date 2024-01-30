# Define variables
DOCKER_COMPOSE = docker-compose
IMAGE_NAME = mydockerimage
CONTAINER_NAME = MY_MVP_CONTAINER
PORT = 8080

# Build Docker image
build:
	$(DOCKER_COMPOSE) build
	$(DOCKER_COMPOSE) up
	

# Run Docker container using Docker Compose
up:  
	$(DOCKER_COMPOSE) up

# Stop Docker container using Docker Compose
down:
	$(DOCKER_COMPOSE) down

# Remove Docker container and image
clean:
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker-compose rm -f

# Default target
default: build

