# Docker Build Guide

This guide helps you build the PdfDing Docker image successfully on different Docker setups.

## Quick Start

The repository has been configured to work with both legacy Docker and modern BuildKit:

```bash
# Build with the Makefile (recommended)
make build

# Or build directly
docker build -t pdfding:custom .
```

## Docker BuildKit Issues

If you encounter errors like `"--chmod option requires BuildKit"`, the Dockerfile has been updated to work without BuildKit. However, you can also enable BuildKit for better performance:

### Method 1: Environment Variable (Temporary)
```bash
DOCKER_BUILDKIT=1 docker build -t pdfding:custom .

# Or use the Makefile target
make build-buildkit
```

### Method 2: Enable BuildKit Globally
Add to your shell profile (`.bashrc`, `.zshrc`, etc.):
```bash
export DOCKER_BUILDKIT=1
```

### Method 3: Docker Daemon Configuration
Create or edit `/etc/docker/daemon.json`:
```json
{
  "features": {
    "buildkit": true
  }
}
```
Then restart Docker daemon:
```bash
sudo systemctl restart docker
```

## Build Options

The Makefile supports several build options:

```bash
# Standard build (works on all Docker versions)
make build

# Build with BuildKit explicitly enabled
make build-buildkit

# Build with custom environment variables
USE_BUILDKIT=1 make build

# Build and run immediately
make run
```

## Troubleshooting

### Issue: "buildx not found"
This is normal on older Docker installations. The repository works fine without buildx.

### Issue: Legacy builder deprecation warning
This warning can be ignored. The build will complete successfully.

### Issue: Build context too large
The build might be slow if you have large files in the repository. Consider adding files to `.dockerignore`:

```bash
echo "*.log" >> .dockerignore
echo "node_modules" >> .dockerignore
echo ".git" >> .dockerignore
```

### Issue: Node.js build failures
Make sure you have internet connectivity for downloading dependencies during the build process.

## Performance Tips

1. **Use BuildKit** when available for faster builds and better caching
2. **Clean build cache** occasionally with `docker system prune`
3. **Use multi-stage builds** (already configured in the Dockerfile)
4. **Enable Docker layer caching** if using CI/CD

## Build Process Overview

The Docker build process includes:

1. **Node.js build stage**: Builds frontend assets (CSS, JS, PDF.js)
2. **Python build stage**: Installs Python dependencies with Poetry
3. **Runtime stage**: Creates minimal runtime image

Total build time: ~5-10 minutes depending on your system and internet connection.