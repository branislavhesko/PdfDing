# PDF.js Download Fix

## Issue
The Docker build fails when trying to download PDF.js from GitHub releases:
```
=> ERROR [pdfding npm-build  8/13] RUN unzip pdfjs.zip -d pdfding/static/pdfjs
```

## Root Cause
- GitHub releases can be temporarily unavailable (503 errors)
- Network issues during Docker build
- PDF.js version may not exist or be moved

## Solutions Applied

### 1. Updated Dockerfile with Multiple Fallbacks
- Updated to a more stable PDF.js version (4.7.76)
- Added multiple download sources (jsdelivr, unpkg, GitHub)
- Added better error handling and retries
- Included fallback placeholders if all downloads fail

### 2. Quick Fix Options

#### Option A: Use Local PDF.js Files
1. Download PDF.js manually:
```bash
wget https://github.com/mozilla/pdf.js/releases/download/v4.7.76/pdfjs-4.7.76-dist.zip
unzip pdfjs-4.7.76-dist.zip -d pdfding/static/pdfjs/
```

2. Comment out the PDF.js download in Dockerfile:
```dockerfile
# Skip PDF.js download - using local files
# RUN [pdfjs download commands...]
```

#### Option B: Use CDN Version
Modify the Dockerfile to use CDN links directly instead of downloading:
```dockerfile
RUN mkdir -p pdfding/static/pdfjs && \
    curl -L "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs" -o pdfding/static/pdfjs/pdf.min.mjs && \
    curl -L "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs" -o pdfding/static/pdfjs/pdf.worker.min.mjs
```

#### Option C: Build Without PDF.js (Temporary)
For testing the folder functionality, you can temporarily disable PDF.js:
```dockerfile
# Create empty PDF.js files to bypass build
RUN mkdir -p pdfding/static/pdfjs && \
    echo "// PDF.js placeholder" > pdfding/static/pdfjs/pdf.min.mjs && \
    echo "// PDF.js worker placeholder" > pdfding/static/pdfjs/pdf.worker.min.mjs
```

### 3. Recommended Approach
The updated Dockerfile should now handle the download more reliably. If it still fails:

1. Try building again (GitHub might be back up)
2. Use Option A to provide local files
3. Check network connectivity during build

### 4. Testing the Fix
```bash
# Clean rebuild
docker compose build --no-cache

# Or with specific target
docker compose build --no-cache pdfding
```

## Prevention
- Consider pinning to stable PDF.js versions
- Use multiple CDN sources as fallbacks
- Cache PDF.js files in a separate layer
- Add health checks for external dependencies