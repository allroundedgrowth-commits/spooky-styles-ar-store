# Spooky Styles Deployment Guide

This guide covers the deployment configuration and processes for the Spooky Styles AR Store.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment Strategies](#deployment-strategies)
- [Manual Deployment](#manual-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Troubleshooting](#troubleshooting)

## Overview

The Spooky Styles deployment architecture uses:

- **Docker** for containerization
- **GitHub Actions** for CI/CD automation
- **AWS ECS** for container orchestration
- **Blue-Green Deployment** for zero-downtime production releases
- **Automatic Rollback** on error threshold detection

## Prerequisites

### Required Tools

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+
- AWS CLI 2.0+
- Git

### AWS Resources

The following AWS resources must be provisioned:

#### Staging Environment
- ECS Cluster: `spooky-styles-staging`
- ECS Service: `spooky-styles-staging-blue`
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- Application Load Balancer
- S3 bucket for assets
- CloudFront distribution

#### Production Environment
- ECS Cluster: `spooky-styles-prod`
- ECS Services: `spooky-styles-prod-blue`, `spooky-styles-prod-green`
- RDS PostgreSQL instance (Multi-AZ)
- ElastiCache Redis cluster (Multi-AZ)
- Application Load Balancer with 2 target groups
- S3 bucket for assets
- CloudFront distribution

### GitHub Secrets

Configure the following secrets in your GitHub repository:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
DOCKER_REGISTRY
DOCKER_USERNAME
DOCKER_PASSWORD
```

## Environment Configuration

### Staging Environment

Copy `.env.staging` and update with your staging credentials:

```bash
cp .env.staging .env.staging.local
# Edit .env.staging.local with actual values
```

### Production Environment

Copy `.env.production` and update with your production credentials:

```bash
cp .env.production .env.production.local
# Edit .env.production.local with actual values
```

**Important:** Never commit `.env.*.local` files to version control.

## Local Development

### Start Services with Docker Compose

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Run database migrations
cd backend
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start backend in development mode
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

### Stop Services

```bash
docker-compose down
```

## CI/CD Pipeline

The GitHub Actions pipeline automatically:

1. **On Pull Request:**
   - Runs linting and tests
   - Builds backend and frontend
   - Runs database migrations

2. **On Push to `develop` branch:**
   - Runs all tests
   - Builds Docker image
   - Deploys to staging environment
   - Runs smoke tests
   - Automatically rolls back on failure

3. **On Push to `main` branch:**
   - Runs all tests
   - Builds Docker image
   - Deploys to production using blue-green strategy
   - Monitors error rates
   - Switches traffic to new environment
   - Automatically rolls back if error rate > 5%

### Pipeline Stages

```
┌─────────────┐
│   Test      │
│  & Lint     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Build     │
│   Docker    │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Deploy    │ │   Deploy    │ │   Deploy    │
│  Staging    │ │ Production  │ │ Production  │
│   (dev)     │ │   Blue      │ │   Green     │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Deployment Strategies

### Staging Deployment

Staging uses a simple rolling deployment:

1. Build new Docker image
2. Push to registry
3. Update ECS task definition
4. Deploy to ECS service
5. Wait for service to stabilize
6. Run health checks
7. Rollback on failure

### Production Deployment (Blue-Green)

Production uses blue-green deployment for zero downtime:

1. Determine active environment (blue or green)
2. Deploy to inactive environment
3. Wait for deployment to stabilize
4. Run health checks on new environment
5. Monitor error rates for 2 minutes
6. Switch load balancer traffic to new environment
7. Keep old environment running for quick rollback

**Benefits:**
- Zero downtime deployments
- Instant rollback capability
- Safe testing of new version before traffic switch
- Reduced risk of deployment failures

### Automatic Rollback

The pipeline automatically rolls back if:

- Health checks fail (HTTP status != 200)
- Error rate exceeds 5%
- Deployment fails to stabilize within timeout
- Smoke tests fail

## Manual Deployment

### Deploy to Staging

```bash
./scripts/deploy.sh staging
```

### Deploy to Production

```bash
./scripts/deploy.sh production
```

The script will:
1. Prompt for confirmation
2. Build Docker image
3. Push to registry
4. Deploy using blue-green strategy
5. Run health checks
6. Prompt before switching traffic

### Make Scripts Executable

```bash
chmod +x scripts/deploy.sh
chmod +x scripts/rollback.sh
```

## Rollback Procedures

### Automatic Rollback

The CI/CD pipeline automatically rolls back on failure. No manual intervention required.

### Manual Rollback

#### Rollback Staging

```bash
./scripts/rollback.sh staging
```

#### Rollback Production

```bash
./scripts/rollback.sh production
```

The production rollback:
1. Identifies current active environment
2. Checks health of previous environment
3. Switches load balancer traffic back
4. Completes in seconds (no redeployment needed)

### Emergency Rollback via AWS Console

If scripts fail, manually switch traffic:

1. Go to AWS Console → EC2 → Load Balancers
2. Select `spooky-styles-prod` load balancer
3. Go to Listeners tab
4. Edit default action
5. Change target group to previous environment
6. Save changes

## Monitoring and Health Checks

### Health Check Endpoint

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-15T10:30:00.000Z"
}
```

### Docker Health Checks

The Dockerfile includes a health check that runs every 30 seconds:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', ...)"
```

### ECS Health Checks

ECS monitors container health and automatically replaces unhealthy containers.

### Application Load Balancer Health Checks

ALB performs health checks on target groups:
- Interval: 30 seconds
- Timeout: 5 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3

### Monitoring Metrics

Monitor these key metrics:

- **API Response Time:** < 200ms (p95)
- **Error Rate:** < 5%
- **CPU Utilization:** < 70%
- **Memory Utilization:** < 80%
- **Database Connections:** < 80% of pool
- **Redis Hit Rate:** > 80%

### Alerts

Configure alerts for:
- Error rate > 5%
- Response time > 500ms (p95)
- Failed deployments
- Health check failures
- Database connection pool exhaustion

## Troubleshooting

### Deployment Fails to Start

**Symptoms:** Container starts but immediately exits

**Solutions:**
1. Check container logs: `docker logs <container-id>`
2. Verify environment variables are set correctly
3. Check database connectivity
4. Verify Redis connectivity

### Health Checks Failing

**Symptoms:** Container marked as unhealthy

**Solutions:**
1. Check if application is listening on correct port
2. Verify health endpoint returns 200 status
3. Check application logs for errors
4. Increase health check timeout if needed

### Database Migration Errors

**Symptoms:** Application fails to start due to database schema issues

**Solutions:**
1. Run migrations manually: `npm run db:migrate`
2. Check migration files for errors
3. Verify database credentials
4. Check database connectivity

### High Error Rate After Deployment

**Symptoms:** Error rate spikes after deployment

**Solutions:**
1. Automatic rollback should trigger
2. If not, manually rollback: `./scripts/rollback.sh production`
3. Check application logs for errors
4. Verify environment variables
5. Check external service connectivity (Stripe, AWS)

### Blue-Green Switch Fails

**Symptoms:** Traffic switch fails during production deployment

**Solutions:**
1. Check load balancer configuration
2. Verify target group health
3. Manually switch via AWS Console
4. Check listener rules

### Docker Build Fails

**Symptoms:** Docker build fails during CI/CD

**Solutions:**
1. Check Dockerfile syntax
2. Verify all dependencies are in package.json
3. Check for missing files in .dockerignore
4. Clear Docker build cache: `docker builder prune`

### Out of Memory Errors

**Symptoms:** Container crashes with OOM error

**Solutions:**
1. Increase container memory limits in ECS task definition
2. Check for memory leaks in application
3. Optimize database queries
4. Implement pagination for large datasets

## Best Practices

1. **Always test in staging first** before deploying to production
2. **Monitor deployments** for at least 10 minutes after traffic switch
3. **Keep old environment running** for at least 1 hour after production deployment
4. **Run database migrations** during low-traffic periods
5. **Use feature flags** for risky changes
6. **Document all manual changes** made to infrastructure
7. **Review logs** after each deployment
8. **Test rollback procedures** regularly in staging

## Support

For deployment issues:
1. Check this documentation
2. Review application logs
3. Check AWS CloudWatch logs
4. Contact DevOps team

---

**Last Updated:** November 15, 2024
