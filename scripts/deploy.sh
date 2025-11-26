#!/bin/bash

# Deployment script for Spooky Styles
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎃 Spooky Styles Deployment Script${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    exit 1
fi

# Load environment variables
if [ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
    echo -e "${GREEN}Loading environment variables from .env.$ENVIRONMENT${NC}"
    export $(cat "$PROJECT_ROOT/.env.$ENVIRONMENT" | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env.$ENVIRONMENT file not found${NC}"
    exit 1
fi

# Confirm production deployment
if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to PRODUCTION${NC}"
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

# Build Docker image
echo -e "${GREEN}Building Docker image...${NC}"
cd "$PROJECT_ROOT/backend"
docker build -t spooky-styles-backend:$ENVIRONMENT .

# Tag image
IMAGE_TAG="${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
docker tag spooky-styles-backend:$ENVIRONMENT $DOCKER_REGISTRY/spooky-styles-backend:$IMAGE_TAG
docker tag spooky-styles-backend:$ENVIRONMENT $DOCKER_REGISTRY/spooky-styles-backend:$ENVIRONMENT-latest

# Push to registry
echo -e "${GREEN}Pushing image to registry...${NC}"
docker push $DOCKER_REGISTRY/spooky-styles-backend:$IMAGE_TAG
docker push $DOCKER_REGISTRY/spooky-styles-backend:$ENVIRONMENT-latest

# Deploy based on environment
if [ "$ENVIRONMENT" == "staging" ]; then
    echo -e "${GREEN}Deploying to staging...${NC}"
    
    # Update ECS service
    aws ecs update-service \
        --cluster spooky-styles-staging \
        --service spooky-styles-staging-blue \
        --force-new-deployment \
        --region $AWS_REGION
    
    echo -e "${GREEN}Waiting for deployment to complete...${NC}"
    aws ecs wait services-stable \
        --cluster spooky-styles-staging \
        --services spooky-styles-staging-blue \
        --region $AWS_REGION
    
    echo -e "${GREEN}✅ Staging deployment complete!${NC}"
    echo -e "URL: https://staging.spookystyles.com"

elif [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${GREEN}Deploying to production with blue-green strategy...${NC}"
    
    # Determine active environment
    ACTIVE_TARGET=$(aws elbv2 describe-target-groups \
        --names spooky-styles-prod-active \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text \
        --region $AWS_REGION)
    
    BLUE_TARGET=$(aws elbv2 describe-target-groups \
        --names spooky-styles-prod-blue \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text \
        --region $AWS_REGION)
    
    if [ "$ACTIVE_TARGET" == "$BLUE_TARGET" ]; then
        DEPLOY_TO="green"
        ACTIVE="blue"
    else
        DEPLOY_TO="blue"
        ACTIVE="green"
    fi
    
    echo -e "${YELLOW}Active environment: $ACTIVE${NC}"
    echo -e "${YELLOW}Deploying to: $DEPLOY_TO${NC}"
    
    # Deploy to inactive environment
    aws ecs update-service \
        --cluster spooky-styles-prod \
        --service spooky-styles-prod-$DEPLOY_TO \
        --force-new-deployment \
        --region $AWS_REGION
    
    echo -e "${GREEN}Waiting for deployment to complete...${NC}"
    aws ecs wait services-stable \
        --cluster spooky-styles-prod \
        --services spooky-styles-prod-$DEPLOY_TO \
        --region $AWS_REGION
    
    # Health check
    echo -e "${GREEN}Running health checks...${NC}"
    LB_DNS=$(aws elbv2 describe-load-balancers \
        --names spooky-styles-prod-$DEPLOY_TO \
        --query 'LoadBalancers[0].DNSName' \
        --output text \
        --region $AWS_REGION)
    
    for i in {1..10}; do
        HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$LB_DNS/health)
        if [ $HEALTH_STATUS -eq 200 ]; then
            echo -e "${GREEN}✅ Health check passed${NC}"
            break
        fi
        echo "Health check attempt $i failed, retrying..."
        sleep 10
    done
    
    if [ $HEALTH_STATUS -ne 200 ]; then
        echo -e "${RED}❌ Health checks failed, aborting deployment${NC}"
        exit 1
    fi
    
    # Switch traffic
    echo -e "${YELLOW}Switching traffic to $DEPLOY_TO environment...${NC}"
    read -p "Proceed with traffic switch? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${RED}Traffic switch cancelled${NC}"
        exit 1
    fi
    
    NEW_TARGET_ARN=$(aws elbv2 describe-target-groups \
        --names spooky-styles-prod-$DEPLOY_TO \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text \
        --region $AWS_REGION)
    
    LISTENER_ARN=$(aws elbv2 describe-listeners \
        --load-balancer-arn $(aws elbv2 describe-load-balancers \
            --names spooky-styles-prod \
            --query 'LoadBalancers[0].LoadBalancerArn' \
            --output text \
            --region $AWS_REGION) \
        --query 'Listeners[0].ListenerArn' \
        --output text \
        --region $AWS_REGION)
    
    aws elbv2 modify-listener \
        --listener-arn $LISTENER_ARN \
        --default-actions Type=forward,TargetGroupArn=$NEW_TARGET_ARN \
        --region $AWS_REGION
    
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
    echo -e "URL: https://spookystyles.com"
    echo -e "${YELLOW}Note: Old environment ($ACTIVE) is still running for quick rollback${NC}"
fi

echo ""
echo -e "${GREEN}🎃 Deployment completed successfully!${NC}"
