# Host Configuration Guide

This guide explains how to configure PdfDing for different domains and deployment scenarios.

## Quick Start

The application is now configured with sensible defaults that work for most scenarios:

```bash
# Works for local development and the configured domains
make run
```

## Default Configuration

The application is configured for production use by default:
- **Default HOST_NAME**: `pdf.hesko.space` (primary domain)
- **Default ALLOWED_HOSTS**: `127.0.0.1,localhost,pdf.hesko.space,pdf.hesko.ai`

This means the application works out-of-the-box for:
- Production domains: `pdf.hesko.space`, `pdf.hesko.ai`
- Local development: `127.0.0.1`, `localhost`

## Custom Host Configuration

### Method 1: Environment Variables
```bash
# Single domain
HOST_NAME=yourdomain.com ALLOWED_HOSTS=yourdomain.com make run

# Multiple domains
ALLOWED_HOSTS=yourdomain.com,app.yourdomain.com,127.0.0.1 make run

# Custom configuration with all options
SECRET_KEY=your-secret \
HOST_NAME=yourdomain.com \
ALLOWED_HOSTS=yourdomain.com,app.yourdomain.com,127.0.0.1,localhost \
make run
```

### Method 2: Docker Compose Override
Create a `docker-compose.override.yml` file:

```yaml
services:
  pdfding:
    environment:
      - HOST_NAME=yourdomain.com
      - ALLOWED_HOSTS=yourdomain.com,app.yourdomain.com,127.0.0.1,localhost
```

### Method 3: Environment File
Create a `.env` file in the repository root:

```env
SECRET_KEY=your-very-long-secret-key
HOST_NAME=yourdomain.com
ALLOWED_HOSTS=yourdomain.com,app.yourdomain.com,127.0.0.1,localhost
DEFAULT_THEME=dark
DEFAULT_THEME_COLOR=blue
CSRF_COOKIE_SECURE=FALSE
SESSION_COOKIE_SECURE=FALSE
```

Then run: `make run`

## Common Scenarios

### Local Development
```bash
# Use the dedicated local development target
make local

# Or use the default (works for both local and production domains)
make run

# Or explicitly set localhost only
HOST_NAME=127.0.0.1 ALLOWED_HOSTS=127.0.0.1,localhost make run
```

### Single Domain Deployment
```bash
HOST_NAME=yourdomain.com ALLOWED_HOSTS=yourdomain.com,127.0.0.1 make run
```

### Multiple Domain Deployment
```bash
ALLOWED_HOSTS=domain1.com,domain2.com,app.domain.com,127.0.0.1 make run
```

### Production Deployment
```bash
# The production target automatically sets secure cookies
SECRET_KEY=your-production-secret \
HOST_NAME=yourdomain.com \
ALLOWED_HOSTS=yourdomain.com \
make production
```

### Development with Custom Domain
```bash
# For development with a custom domain (e.g., using ngrok or local DNS)
HOST_NAME=myapp.local ALLOWED_HOSTS=myapp.local,127.0.0.1,localhost make dev
```

## Environment Variables Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `HOST_NAME` | Primary hostname for the application | `pdf.hesko.space` | `yourdomain.com` |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `127.0.0.1,localhost,pdf.hesko.space,pdf.hesko.ai` | `domain.com,app.domain.com` |
| `SECRET_KEY` | Django secret key | Random default | `your-secure-secret-key` |
| `CSRF_COOKIE_SECURE` | Enable secure CSRF cookies | `FALSE` | `TRUE` for HTTPS |
| `SESSION_COOKIE_SECURE` | Enable secure session cookies | `FALSE` | `TRUE` for HTTPS |

## Security Considerations

### Production Settings
Always use secure settings for production:

```bash
SECRET_KEY=your-very-long-secure-secret-key \
HOST_NAME=yourdomain.com \
ALLOWED_HOSTS=yourdomain.com \
CSRF_COOKIE_SECURE=TRUE \
SESSION_COOKIE_SECURE=TRUE \
make run
```

### HTTPS Configuration
When using HTTPS, set secure cookie flags:
- `CSRF_COOKIE_SECURE=TRUE`
- `SESSION_COOKIE_SECURE=TRUE`

### Wildcard Hosts
Avoid using `*` in `ALLOWED_HOSTS` for production:

```bash
# ❌ Insecure for production
ALLOWED_HOSTS=* make run

# ✅ Secure for production
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com make run
```

## Troubleshooting

### Error: "Invalid HTTP_HOST header"
This happens when the domain you're accessing is not in `ALLOWED_HOSTS`.

**Solution:**
```bash
# Add your domain to ALLOWED_HOSTS
ALLOWED_HOSTS=yourdomain.com,127.0.0.1,localhost make run
```

### Error: "DisallowedHost"
Same as above - add the host to the allowed list.

### Error: "CSRF verification failed"
When using HTTPS, make sure secure cookies are enabled:
```bash
CSRF_COOKIE_SECURE=TRUE SESSION_COOKIE_SECURE=TRUE make run
```

### Multiple Domains Not Working
Make sure all domains are comma-separated without spaces:
```bash
# ✅ Correct
ALLOWED_HOSTS=domain1.com,domain2.com,localhost

# ❌ Incorrect (spaces)
ALLOWED_HOSTS=domain1.com, domain2.com, localhost
```

## Advanced Configuration

### Using a Reverse Proxy
When using nginx or another reverse proxy:

```bash
# Include the proxy host and original domain
ALLOWED_HOSTS=yourdomain.com,proxy.internal,127.0.0.1 make run
```

### Docker Networking
When using custom Docker networks:

```bash
# Include the container hostname
ALLOWED_HOSTS=yourdomain.com,pdfding,127.0.0.1 make run
```

### Load Balancer Setup
When using load balancers, include all relevant hostnames:

```bash
ALLOWED_HOSTS=yourdomain.com,lb.internal,backend1.internal,backend2.internal make run
```

## Testing Configuration

Test your host configuration:

```bash
# Start the application
make run

# Test different URLs
curl -H "Host: yourdomain.com" http://127.0.0.1:8000/
curl -H "Host: 127.0.0.1" http://127.0.0.1:8000/
curl -H "Host: localhost" http://127.0.0.1:8000/
```

Successful requests should return the PdfDing homepage, while disallowed hosts will return a 400 Bad Request error.