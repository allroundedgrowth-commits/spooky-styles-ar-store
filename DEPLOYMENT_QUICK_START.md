# Deployment Quick Start Guide

Quick reference for deploying Spooky Styles AR Store.

## 🚀 Quick Deploy

### Local Development

```bash
# Start services
docker-compose up -d

# Setup database
cd backend
npm run db:migrate
npm run db:seed

# Start backend
npm run dev

# Start frontend (in new terminal)
cd frontend
npm run dev
```

Access at: http://localhost:5173

### Deploy to Staging

```bash
# Automatic (via GitHub)
git push origin develop

# Manual
./scripts/deploy.sh staging
```

### Deploy to Production

```bash
# Automatic (via GitHub)
git push origin main

# Manual
./scripts/deploy.sh production
```

## 🔄 Rollback

### Staging

```bash
./scripts/rollback.sh staging
```

### Production

```bash
./scripts/rollback.sh production
```

## 🏥 Health Check

```bash
# Local
curl http://localhost:3000/health

# Staging
curl https://staging.spookystyles.com/health

# Production
curl https://spookystyles.com/health
```

## 📊 Monitor Deployment

### Check ECS Service Status

```bash
# Staging
aws ecs describe-services \
  --cluster spooky-styles-staging \
  --services spooky-styles-staging-blue \
  --region us-east-1

# Production
aws ecs describe-services \
  --cluster spooky-styles-prod \
  --services spooky-styles-prod-blue spooky-styles-prod-green \
  --region us-east-1
```

### View Logs

```bash
# Get task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster spooky-styles-prod \
  --service-name spooky-styles-prod-blue \
  --query 'taskArns[0]' \
  --output text)

# View logs
aws logs tail /ecs/spooky-styles-prod --follow
```

## 🐛 Troubleshooting

### Deployment Stuck

```bash
# Check service events
aws ecs describe-services \
  --cluster spooky-styles-prod \
  --services spooky-styles-prod-blue \
  --query 'services[0].events[0:5]'
```

### Container Crashes

```bash
# View container logs
docker logs <container-id>

# Or via AWS
aws logs tail /ecs/spooky-styles-prod --since 10m
```

### Database Connection Issues

```bash
# Test database connection
cd backend
npm run db:test
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli -h <redis-host> ping
```

## 📝 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Secrets updated in AWS/GitHub
- [ ] Staging deployment successful
- [ ] Smoke tests passed
- [ ] Monitoring alerts configured
- [ ] Rollback plan ready

## 🔐 Environment Variables

### Required for All Environments

```bash
NODE_ENV
PORT
DATABASE_URL
REDIS_URL
JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME
CLOUDFRONT_DOMAIN
CLOUDFRONT_KEY_PAIR_ID
CLOUDFRONT_PRIVATE_KEY
CORS_ORIGIN
```

## 📞 Emergency Contacts

- **DevOps Team:** devops@spookystyles.com
- **On-Call:** +1-XXX-XXX-XXXX
- **Slack:** #spooky-styles-alerts

## 🔗 Useful Links

- [Full Deployment Guide](./DEPLOYMENT.md)
- [AWS Console](https://console.aws.amazon.com)
- [GitHub Actions](https://github.com/your-org/spooky-styles/actions)
- [Monitoring Dashboard](https://app.datadoghq.com)

---

**Last Updated:** November 15, 2024
