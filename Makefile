.PHONY: help install dev build start stop clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for frontend and backend
	@echo "Installing frontend dependencies..."
	cd Frontend && npm install
	@echo "Installing backend dependencies..."
	cd Backend && mvn clean install -DskipTests
	@echo "Installation complete!"

dev-frontend: ## Start frontend development server
	cd Frontend && npm run dev

dev-backend: ## Start backend development server
	cd Backend && mvn spring-boot:run

dev: ## Start both frontend and backend in development mode
	@echo "Starting development servers..."
	@make -j2 dev-frontend dev-backend

build-frontend: ## Build frontend for production
	cd Frontend && npm run build

build-backend: ## Build backend JAR
	cd Backend && mvn clean package

build: ## Build both frontend and backend
	@echo "Building frontend..."
	@make build-frontend
	@echo "Building backend..."
	@make build-backend
	@echo "Build complete!"

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start all services with Docker
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## Show Docker logs
	docker-compose logs -f

clean-frontend: ## Clean frontend build artifacts
	cd Frontend && rm -rf .next node_modules

clean-backend: ## Clean backend build artifacts
	cd Backend && mvn clean

clean: ## Clean all build artifacts
	@make clean-frontend
	@make clean-backend
	@echo "Clean complete!"

test-frontend: ## Run frontend tests
	cd Frontend && npm test

test-backend: ## Run backend tests
	cd Backend && mvn test

test: ## Run all tests
	@make test-frontend
	@make test-backend
