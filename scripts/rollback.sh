#!/bin/bash

# Rollback script for Spooky Styles
# Usage: ./scripts/rollback.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}🎃 Spooky Styles Rollback Script${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    exit 1
fi

# Load environment variables
if [ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
    export $(cat "$PROJECT_ROOT/.env.$ENVIRONMENT" | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env.$ENVIRONMENT file not found${NC}"
    exit 1
fi

# Confirm rollback
echo -e "${YELLOW}⚠️  WARNING: You are about to rollback $ENVIRONMENT${NC}"
read -p "Are you sure you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}Rollback cancelled${NC}"
    exit 1
fi

if [ "$ENVIRONMENT" == "staging" ]; then
    echo -e "${GREEN}Rolling back staging...${NC}"
    
    # Get previous task definition
    PREVIOUS_TASK_DEF=$(aws ecs describe-services \
        --cluster spooky-styles-staging \
        --services spooky-styles-staging-blue \
        --query 'services[0].deployments[1].taskDefinition' \
        --output text \
        --region $AWS_REGION)
    
    if [ -z "$PREVIOUS_TASK_DEF" ] || [ "$PREVIOUS_TASK_DEF" == "None" ]; then
        echo -e "${RED}Error: No previous deployment found${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Rolling back to: $PREVIOUS_TASK_DEF${NC}"
    
    # Rollback
    aws ecs update-service \
        --cluster spooky-styles-staging \
        --service spooky-styles-staging-blue \
        --task-definition $PREVIOUS_TASK_DEF \
        --force-new-deployment \
        --region $AWS_REGION
    
    echo -e "${GREEN}Waiting for rollback to complete...${NC}"
    aws ecs wait services-stable \
        --cluster spooky-styles-staging \
        --services spooky-styles-staging-blue \
        --region $AWS_REGION
    
    echo -e "${GREEN}✅ Staging rollback complete!${NC}"

elif [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${GREEN}Rolling back production...${NC}"
    
    # Determine current active environment
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
        CURRENT="blue"
        ROLLBACK_TO="green"
    else
        CURRENT="green"
        ROLLBACK_TO="blue"
    fi
    
    echo -e "${YELLOW}Current active: $CURRENT${NC}"
    echo -e "${YELLOW}Rolling back to: $ROLLBACK_TO${NC}"
    
    # Health check on rollback target
    echo -e "${GREEN}Checking health of $ROLLBACK_TO environment...${NC}"
    LB_DNS=$(aws elbv2 describe-load-balancers \
        --names spooky-styles-prod-$ROLLBACK_TO \
        --query 'LoadBalancers[0].DNSName' \
        --output text \
        --region $AWS_REGION)
    
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$LB_DNS/health)
    if [ $HEALTH_STATUS -ne 200 ]; then
        echo -e "${RED}Error: Rollback target is not healthy (status: $HEALTH_STATUS)${NC}"
        echo -e "${YELLOW}You may need to manually fix the $ROLLBACK_TO environment${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Rollback target is healthy${NC}"
    
    # Switch traffic back
    echo -e "${GREEN}Switching traffic to $ROLLBACK_TO environment...${NC}"
    
    ROLLBACK_TARGET_ARN=$(aws elbv2 describe-target-groups \
        --names spooky-styles-prod-$ROLLBACK_TO \
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
        --default-actions Type=forward,TargetGroupArn=$ROLLBACK_TARGET_ARN \
        --region $AWS_REGION
    
    echo -e "${GREEN}✅ Production rollback complete!${NC}"
    echo -e "${YELLOW}Traffic has been switched back to $ROLLBACK_TO${NC}"
fi

echo ""
echo -e "${GREEN}🎃 Rollback completed successfully!${NC}"
