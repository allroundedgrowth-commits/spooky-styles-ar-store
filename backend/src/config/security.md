# Security Configuration Guide

## HTTPS/TLS Configuration for Production

### Overview
This document provides guidance on configuring HTTPS/TLS for the Spooky Styles backend API in production environments.

### Prerequisites
- Valid SSL/TLS certificate (from Let's Encrypt, AWS Certificate Manager, or commercial CA)
- Domain name configured with DNS
- Production server with Node.js installed

---

## Option 1: Using Reverse Proxy (Recommended)

### Nginx Configuration

The recommended approach is to use Nginx as a reverse proxy to handle SSL/TLS termination.

**Install Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

**Nginx Configuration (`/etc/nginx/sites-available/spooky-styles`):**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.spookystyles.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name api.spookystyles.com;

    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/api.spookystyles.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.spookystyles.com/privkey.pem;

    # SSL Protocol Configuration (TLS 1.2 and 1.3 only)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    # SSL Session Configuration
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase body size for file uploads
    client_max_body_size 10M;
}
```

**Enable the configuration:**
```bash
sudo ln -s /etc/nginx/sites-available/spooky-styles /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Let's Encrypt SSL Certificate

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtain Certificate:**
```bash
sudo certbot --nginx -d api.spookystyles.com
```

**Auto-renewal:**
Certbot automatically sets up a cron job for renewal. Test it with:
```bash
sudo certbot renew --dry-run
```

---

## Option 2: Node.js HTTPS Server (Alternative)

If you prefer to handle HTTPS directly in Node.js:

**Update `backend/src/index.ts`:**
```typescript
import https from 'https';
import fs from 'fs';
import path from 'path';

// ... existing imports and setup ...

const startServer = async () => {
  try {
    await connectRedis();
    
    if (process.env.NODE_ENV === 'production') {
      // HTTPS Server for production
      const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, '../ssl/privkey.pem')),
        cert: fs.readFileSync(path.join(__dirname, '../ssl/fullchain.pem')),
      };
      
      https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log(`🎃 HTTPS Backend server running on port ${PORT}`);
      });
    } else {
      // HTTP Server for development
      app.listen(PORT, () => {
        console.log(`🎃 HTTP Backend server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
```

**Certificate Paths:**
Place your SSL certificates in `backend/ssl/`:
- `privkey.pem` - Private key
- `fullchain.pem` - Full certificate chain

---

## Option 3: Cloud Platform SSL/TLS

### AWS Elastic Beanstalk
1. Upload SSL certificate to AWS Certificate Manager (ACM)
2. Configure Load Balancer to use HTTPS listener
3. Set up security group to allow port 443

### AWS ECS with Application Load Balancer
1. Create certificate in ACM
2. Configure ALB listener for HTTPS (port 443)
3. Add target group pointing to ECS service

### Heroku
```bash
heroku certs:auto:enable
```

### Vercel/Netlify
SSL/TLS is automatically configured for custom domains.

---

## Environment Variables for Production

Add to `.env` file:

```bash
# Force HTTPS in production
NODE_ENV=production
FORCE_HTTPS=true

# Trust proxy (when behind reverse proxy)
TRUST_PROXY=true

# Secure cookie settings
COOKIE_SECURE=true
COOKIE_SAMESITE=strict
```

---

## Application-Level Security Headers

The application already uses `helmet` middleware for security headers. Ensure it's configured properly:

**In `backend/src/index.ts`:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## Testing HTTPS Configuration

### Test SSL/TLS Configuration:
```bash
# Using OpenSSL
openssl s_client -connect api.spookystyles.com:443 -tls1_2

# Using curl
curl -I https://api.spookystyles.com/health
```

### Online SSL Testing Tools:
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [Security Headers](https://securityheaders.com/)

---

## Monitoring and Maintenance

### Certificate Expiration Monitoring
Set up alerts for certificate expiration (typically 30 days before):

```bash
# Check certificate expiration
echo | openssl s_client -servername api.spookystyles.com -connect api.spookystyles.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Log Monitoring
Monitor SSL/TLS errors in application logs:
```bash
tail -f /var/log/nginx/error.log
```

---

## Security Best Practices

1. **Use TLS 1.2 or higher** - Disable older protocols (TLS 1.0, 1.1)
2. **Strong cipher suites** - Use modern, secure cipher suites
3. **HSTS enabled** - Force HTTPS for all requests
4. **Certificate pinning** - Consider for mobile apps
5. **Regular updates** - Keep SSL/TLS libraries updated
6. **Monitor vulnerabilities** - Subscribe to security advisories
7. **Backup certificates** - Store certificates securely
8. **Use strong keys** - Minimum 2048-bit RSA or 256-bit ECC

---

## Troubleshooting

### Common Issues:

**Mixed Content Warnings:**
- Ensure all resources (images, scripts) use HTTPS
- Update CORS_ORIGIN to use https://

**Certificate Chain Issues:**
- Use fullchain.pem instead of cert.pem
- Verify intermediate certificates are included

**Redirect Loops:**
- Check X-Forwarded-Proto header handling
- Verify TRUST_PROXY setting

**Performance Issues:**
- Enable SSL session caching
- Use HTTP/2
- Consider CDN for static assets

---

## Additional Resources

- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP TLS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
