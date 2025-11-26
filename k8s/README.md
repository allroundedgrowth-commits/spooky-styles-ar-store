# Kubernetes Deployment Configuration

This directory contains Kubernetes manifests for deploying Spooky Styles to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- NGINX Ingress Controller installed
- cert-manager installed (for TLS certificates)

## Files

- `deployment.yaml` - Main application deployment
- `service.yaml` - Service to expose the deployment
- `ingress.yaml` - Ingress for external access
- `configmap.yaml` - Non-sensitive configuration
- `hpa.yaml` - Horizontal Pod Autoscaler for auto-scaling

## Setup

### 1. Create Namespace

```bash
kubectl create namespace spooky-styles
```

### 2. Create Secrets

Create a secret with sensitive configuration:

```bash
kubectl create secret generic spooky-styles-secrets \
  --namespace=spooky-styles \
  --from-literal=database-url='postgresql://user:pass@host:5432/db' \
  --from-literal=redis-url='redis://host:6379' \
  --from-literal=jwt-secret='your-jwt-secret' \
  --from-literal=stripe-secret-key='sk_live_xxx' \
  --from-literal=stripe-webhook-secret='whsec_xxx' \
  --from-literal=aws-access-key-id='AKIAXXXXX' \
  --from-literal=aws-secret-access-key='xxxxx' \
  --from-literal=cloudfront-key-pair-id='APKAXXXXX' \
  --from-literal=cloudfront-private-key='-----BEGIN PRIVATE KEY-----...'
```

### 3. Apply ConfigMap

```bash
kubectl apply -f configmap.yaml
```

### 4. Deploy Application

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n spooky-styles

# Check service
kubectl get svc -n spooky-styles

# Check ingress
kubectl get ingress -n spooky-styles

# Check HPA
kubectl get hpa -n spooky-styles
```

## Updating Deployment

### Update Image

```bash
kubectl set image deployment/spooky-styles-backend \
  backend=your-registry/spooky-styles-backend:new-tag \
  -n spooky-styles
```

### Rollout Status

```bash
kubectl rollout status deployment/spooky-styles-backend -n spooky-styles
```

### Rollback

```bash
kubectl rollout undo deployment/spooky-styles-backend -n spooky-styles
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment/spooky-styles-backend --replicas=5 -n spooky-styles
```

### Auto-scaling

The HPA automatically scales based on CPU and memory usage:
- Min replicas: 2
- Max replicas: 10
- Target CPU: 70%
- Target Memory: 80%

## Monitoring

### View Logs

```bash
# All pods
kubectl logs -l app=spooky-styles -n spooky-styles

# Specific pod
kubectl logs <pod-name> -n spooky-styles

# Follow logs
kubectl logs -f <pod-name> -n spooky-styles
```

### Pod Status

```bash
kubectl describe pod <pod-name> -n spooky-styles
```

### Events

```bash
kubectl get events -n spooky-styles --sort-by='.lastTimestamp'
```

## Troubleshooting

### Pod Not Starting

```bash
kubectl describe pod <pod-name> -n spooky-styles
kubectl logs <pod-name> -n spooky-styles
```

### Service Not Accessible

```bash
kubectl get endpoints -n spooky-styles
kubectl describe service spooky-styles-backend -n spooky-styles
```

### Ingress Issues

```bash
kubectl describe ingress spooky-styles-ingress -n spooky-styles
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## Cleanup

```bash
kubectl delete namespace spooky-styles
```
