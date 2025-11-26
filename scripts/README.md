# Deployment Scripts

This directory contains scripts for deploying and managing the Spooky Styles AR Store.

## Scripts

### deploy.sh

Deploys the application to staging or production environments.

**Usage:**
```bash
./scripts/deploy.sh [staging|production]
```

**Features:**
- Builds Docker image
- Pushes to registry
- Deploys to AWS ECS
- Runs health checks
- Blue-green deployment for production
- Interactive confirmation prompts

**Examples:**
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### rollback.sh

Rolls back a deployment to the previous version.

**Usage:**
```bash
./scripts/rollback.sh [staging|production]
```

**Features:**
- Reverts to previous task definition
- Validates health of rollback target
- Switches traffic back (production)
- Interactive confirmation prompts

**Examples:**
```bash
# Rollback staging
./scripts/rollback.sh staging

# Rollback production
./scripts/rollback.sh production
```

## Prerequisites

### Required Tools
- Docker
- AWS CLI
- jq (for JSON parsing)
- curl

### Environment Variables

The scripts require environment variables from `.env.staging` or `.env.production`:

```bash
DOCKER_REGISTRY
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### AWS Permissions

The AWS credentials must have permissions for:
- ECS (describe-services, update-service, register-task-definition)
- ELB (describe-load-balancers, describe-target-groups, modify-listener)
- ECR (push images)

## Making Scripts Executable

On Unix-based systems (Linux, macOS):
```bash
chmod +x scripts/deploy.sh
chmod +x scripts/rollback.sh
```

On Windows with Git Bash:
```bash
git update-index --chmod=+x scripts/deploy.sh
git update-index --chmod=+x scripts/rollback.sh
```

## Script Flow

### Deployment Flow (Staging)

```
1. Load environment variables
2. Confirm deployment
3. Build Docker image
4. Tag and push to registry
5. Update ECS service
6. Wait for service to stabilize
7. Run health checks
8. Complete or rollback on failure
```

### Deployment Flow (Production)

```
1. Load environment variables
2. Confirm deployment
3. Build Docker image
4. Tag and push to registry
5. Determine active environment (blue/green)
6. Deploy to inactive environment
7. Wait for service to stabilize
8. Run health checks
9. Confirm traffic switch
10. Switch load balancer traffic
11. Complete
```

### Rollback Flow (Production)

```
1. Load environment variables
2. Confirm rollback
3. Identify current active environment
4. Check health of previous environment
5. Switch traffic back to previous environment
6. Complete
```

## Error Handling

Both scripts include error handling for:
- Missing environment files
- Invalid environment names
- Failed Docker builds
- Failed health checks
- AWS API errors

## Logging

Scripts output colored logs:
- 🟢 Green: Success messages
- 🟡 Yellow: Warnings and prompts
- 🔴 Red: Errors

## Safety Features

### Confirmation Prompts
- Production deployments require explicit confirmation
- Traffic switches require confirmation
- Rollbacks require confirmation

### Health Checks
- Validates deployment health before proceeding
- Retries health checks up to 10 times
- Fails deployment if health checks don't pass

### Automatic Rollback
- Deployment script rolls back on failure
- Preserves previous environment for quick recovery

## Troubleshooting

### Script Won't Execute
```bash
# Make executable
chmod +x scripts/deploy.sh

# Or run with bash
bash scripts/deploy.sh staging
```

### Environment File Not Found
```bash
# Check file exists
ls -la .env.staging .env.production

# Copy from template
cp .env.staging.example .env.staging
```

### AWS Credentials Error
```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Or set credentials
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### Docker Build Fails
```bash
# Check Docker is running
docker ps

# Check Dockerfile exists
ls -la backend/Dockerfile

# Try building manually
cd backend && docker build -t test .
```

### Health Check Fails
```bash
# Check service is running
aws ecs describe-services --cluster spooky-styles-staging --services spooky-styles-staging-blue

# Check task logs
aws logs tail /ecs/spooky-styles-staging --follow

# Test health endpoint manually
curl http://your-load-balancer/health
```

## Best Practices

1. **Always test in staging first** before deploying to production
2. **Review changes** before confirming production deployments
3. **Monitor deployments** for at least 10 minutes after completion
4. **Keep scripts updated** with infrastructure changes
5. **Document any manual changes** made during deployments
6. **Test rollback procedures** regularly in staging

## Alternative: Using Makefile

For convenience, you can use the Makefile commands:

```bash
# Deploy
make deploy-staging
make deploy-production

# Rollback
make rollback-staging
make rollback-production
```

## Support

For issues with deployment scripts:
1. Check script output for error messages
2. Verify environment variables are set
3. Check AWS service status
4. Review [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed troubleshooting

---

**Last Updated:** November 15, 2024
