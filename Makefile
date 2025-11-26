.PHONY: help dev build test deploy-staging deploy-production rollback-staging rollback-production docker-build docker-up docker-down clean

# Default target
help:
	@echo "🎃 Spooky Styles Deployment Commands"
	@echo ""
	@echo "Local Development:"
	@echo "  make dev              - Start local development environment"
	@echo "  make docker-up        - Start Docker services (postgres, redis)"
	@echo "  make docker-down      - Stop Docker services"
	@echo "  make docker-build     - Build backend Docker image"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate       - Run database migrations"
	@echo "  make db-seed          - Seed database with sample data"
	@echo "  make db-setup         - Run migrations and seed"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run all tests"
	@echo "  make lint             - Run linters"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-staging   - Deploy to staging environment"
	@echo "  make deploy-production - Deploy to production environment"
	@echo ""
	@echo "Rollback:"
	@echo "  make rollback-staging - Rollback staging deployment"
	@echo "  make rollback-production - Rollback production deployment"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            - Clean up build artifacts"

# Local Development
dev: docker-up
	@echo "Starting development servers..."
	@cd backend && npm run dev &
	@cd frontend && npm run dev

docker-up:
	@echo "Starting Docker services..."
	@docker-compose up -d postgres redis
	@echo "Waiting for services to be ready..."
	@sleep 5

docker-down:
	@echo "Stopping Docker services..."
	@docker-compose down

docker-build:
	@echo "Building backend Docker image..."
	@cd backend && docker build -t spooky-styles-backend:local .

# Database
db-migrate:
	@echo "Running database migrations..."
	@cd backend && npm run db:migrate

db-seed:
	@echo "Seeding database..."
	@cd backend && npm run db:seed

db-setup: db-migrate db-seed
	@echo "Database setup complete!"

# Testing
test:
	@echo "Running tests..."
	@cd backend && npm test
	@cd frontend && npm test

lint:
	@echo "Running linters..."
	@cd backend && npm run lint
	@cd frontend && npm run lint

# Build
build:
	@echo "Building backend..."
	@cd backend && npm run build
	@echo "Building frontend..."
	@cd frontend && npm run build

# Deployment
deploy-staging:
	@echo "Deploying to staging..."
	@bash scripts/deploy.sh staging

deploy-production:
	@echo "Deploying to production..."
	@bash scripts/deploy.sh production

# Rollback
rollback-staging:
	@echo "Rolling back staging..."
	@bash scripts/rollback.sh staging

rollback-production:
	@echo "Rolling back production..."
	@bash scripts/rollback.sh production

# Cleanup
clean:
	@echo "Cleaning up..."
	@rm -rf backend/dist
	@rm -rf frontend/dist
	@rm -rf node_modules
	@rm -rf backend/node_modules
	@rm -rf frontend/node_modules
	@echo "Cleanup complete!"

# Health checks
health-local:
	@curl -s http://localhost:3000/health | jq

health-staging:
	@curl -s https://staging.spookystyles.com/health | jq

health-production:
	@curl -s https://spookystyles.com/health | jq

# Logs
logs-local:
	@docker-compose logs -f backend

logs-staging:
	@aws logs tail /ecs/spooky-styles-staging --follow --region us-east-1

logs-production:
	@aws logs tail /ecs/spooky-styles-prod --follow --region us-east-1

# Kubernetes
k8s-deploy:
	@echo "Deploying to Kubernetes..."
	@kubectl apply -f k8s/

k8s-status:
	@kubectl get pods -n spooky-styles
	@kubectl get svc -n spooky-styles
	@kubectl get ingress -n spooky-styles

k8s-logs:
	@kubectl logs -l app=spooky-styles -n spooky-styles --tail=100 -f

k8s-delete:
	@kubectl delete namespace spooky-styles
