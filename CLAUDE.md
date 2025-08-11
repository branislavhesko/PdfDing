# PdfDing - Repository Structure and Code Analysis

## Overview
PdfDing is a self-hosted PDF manager, viewer, and editor built with Django 5.1.7 and Python 3.11+. It provides a seamless user experience for managing PDF collections with features like tagging, sharing, annotations, and multi-device viewing.

## Technology Stack
- **Backend**: Django 5.1.7, Python 3.11+
- **Database**: SQLite (default) or PostgreSQL
- **Task Queue**: Huey with SQLite backend
- **PDF Processing**: pypdfium2, pypdf
- **Frontend**: HTMX, Alpine.js, TailwindCSS
- **Authentication**: Django Allauth with OIDC support
- **File Storage**: Local filesystem with optional MinIO support
- **Deployment**: Docker, Kubernetes (Helm), Docker Compose

## Repository Structure

### Root Directory
```
/
├── CHANGELOG.md              # Version history and changes
├── Dockerfile               # Container build configuration
├── README.md                # Project documentation
├── bootstrap.sh             # Application startup script
├── compose/                 # Docker Compose configurations
├── docs/                    # Documentation files
├── helm-charts/             # Kubernetes deployment charts
├── license.txt              # Project license
├── package.json             # Frontend dependencies (Alpine.js, HTMX, TailwindCSS)
├── poetry.lock & pyproject.toml  # Python dependency management
├── setup.cfg                # Python project configuration
├── supervisord.conf         # Process management configuration
└── pdfding/                 # Main Django application
```

### Core Django Application (`pdfding/`)

#### Project Structure
- **`core/`** - Django project settings and configuration
- **`pdf/`** - Main PDF management application
- **`users/`** - User management and profiles
- **`admin/`** - Administrative interface
- **`backup/`** - Data backup and recovery
- **`base/`** - Shared utilities and base views
- **`static/`** - CSS, JavaScript, images
- **`templates/`** - HTML templates
- **`media/`** - User-uploaded files and generated content
- **`db/`** - Database files (SQLite)
- **`e2e/`** - End-to-end tests

## Key Applications

### 1. PDF Application (`pdfding/pdf/`)
**Primary functionality for PDF management**

#### Models (`models.py`)
- **`Tag`** - Hierarchical tagging system for PDF organization
- **`Pdf`** - Core PDF model with metadata, viewing tracking, annotations
- **`PdfAnnotation`** - Base model for PDF annotations
- **`PdfComment`** - Comment annotations extracted from PDFs
- **`PdfHighlight`** - Highlight annotations extracted from PDFs
- **`SharedPdf`** - PDF sharing with access controls and analytics

#### Views (`views/`)
- **`pdf_views.py`** - Main PDF CRUD operations, viewer, search, organization
- **`share_views.py`** - PDF sharing functionality, public access, QR codes

#### Services (`service.py`)
- **`PdfProcessingServices`** - PDF processing pipeline, annotation extraction
- **`TagServices`** - Tag management and hierarchical operations

#### Key Features
- PDF upload with automatic processing (thumbnails, previews, text extraction)
- Web-based PDF viewer with progress tracking
- Hierarchical tagging system with tree view
- Annotation extraction (highlights, comments)
- PDF sharing with access controls
- Search and filtering capabilities
- Bulk upload functionality

### 2. Users Application (`pdfding/users/`)
**User management and personalization**

#### Models (`models.py`)
- **`Profile`** - Extended user profile with preferences
  - Theme settings (Dark/Light/Creme modes)
  - Display preferences (PDFs per page, layouts)
  - Color themes and customization options

#### Features
- User registration and authentication
- Profile customization (themes, display preferences)
- Account settings management
- Demo user support

### 3. Admin Application (`pdfding/admin/`)
**Administrative interface and user management**

#### Features
- User overview and management
- System administration tools
- User analytics and monitoring

### 4. Backup Application (`pdfding/backup/`)
**Data backup and recovery system**

#### Features
- Automated backup tasks
- Data recovery utilities
- Management commands for backup operations

## File Organization

### Media Structure
```
media/
├── {user_id}/
│   ├── pdf/                 # PDF files organized by user (preserves original names)
│   │   └── {subdirectory}/  # Optional subdirectories
│   ├── thumbnails/          # PDF thumbnails
│   ├── previews/           # PDF previews
│   └── qr/                 # QR codes for sharing
└── consume/                # Directory monitoring for auto-import
```

**Note**: PDF files now preserve their original filenames when uploaded, with minimal sanitization only for filesystem safety. This maintains the original file names while ensuring compatibility across different operating systems.

**Filename Length Limits**: All filename length limits have been significantly increased:
- Tag names: 100 characters (doubled from 50)
- PDF names: 300 characters (doubled from 150) 
- File paths: 1000 characters (doubled from 500)
- File directories: 240 characters (doubled from 120)
- Shared PDF names: 300 characters (doubled from 150)

### Database Structure
- **SQLite**: Default database (development and small deployments)
- **PostgreSQL**: Production database option
- **Task Queue**: Separate SQLite database for Huey tasks

## Development Workflow

### Testing
- **Unit Tests**: pytest with Django integration
- **E2E Tests**: Playwright for end-to-end testing
- **Coverage**: pytest-cov for test coverage reporting

### Code Quality
- **Formatting**: Black code formatter
- **Linting**: Flake8 for code quality
- **Security**: Bandit for security analysis

### Build Commands
```bash
# Frontend assets
npm run build          # Build all frontend assets
npm run build:alpine   # Copy Alpine.js
npm run build:htmx     # Copy HTMX

# Python/Django
poetry install         # Install dependencies
python manage.py test  # Run tests
python manage.py migrate  # Database migrations
```

## Key Features Implementation

### PDF Processing Pipeline
1. **Upload Validation** - File type checking, size limits
2. **Metadata Extraction** - Page count, text content
3. **Thumbnail Generation** - Preview images using pypdfium2
4. **Annotation Processing** - Extract existing PDF annotations
5. **File Organization** - User-based directory structure
6. **Database Storage** - Metadata and relationships

### Sharing System
- **Access Controls** - Password protection, view limits, expiration
- **QR Code Generation** - Automatic QR codes for mobile access
- **Public Viewer** - Authentication-free PDF viewing
- **Analytics** - View tracking and statistics

### Tag System
- **Hierarchical Structure** - Nested tags (e.g., "programming/python")
- **Tree View** - Collapsible tag navigation
- **Bulk Operations** - Tag merging, renaming, deletion
- **Search Integration** - Tag-based filtering

### User Experience
- **Responsive Design** - Mobile-friendly interface
- **Theme System** - Multiple color themes and dark mode
- **Progress Tracking** - Reading progress and page memory
- **Search & Filter** - Advanced search with multiple criteria

## Configuration

### Environment Variables
- **Database**: `DATABASE_TYPE`, `POSTGRES_*` settings
- **Security**: `SECRET_KEY`, `CSRF_COOKIE_SECURE`, etc.
- **OIDC**: OpenID Connect configuration
- **File Storage**: Media root and static file settings

### Settings Structure
- **`base.py`** - Common settings
- **`dev.py`** - Development overrides
- **`prod.py`** - Production configuration

## Deployment Options

### Docker (Custom Build)
The repository now includes a comprehensive Makefile for building and running with Docker:

```bash
# Build and run the application
make run

# Show all available commands
make help

# Build the Docker image only
make build

# Start without building
make up

# View logs
make logs

# Stop the application
make down
```

**Key features of the custom Docker setup:**
- Custom Docker image built from local source code
- All filename preservation and length limit improvements included
- Comprehensive Makefile with development and production targets
- SQLite configuration with persistent volumes
- Environment variable configuration
- Development mode with live code editing
- Backup and restore functionality
- Compatible with both legacy Docker and modern BuildKit

**Build Options:**
```bash
# Standard build (works on all Docker versions)
make build

# Build with BuildKit for better performance
USE_BUILDKIT=1 make build
# or
make build-buildkit
```

**Notes:**
- If you encounter BuildKit-related errors, see `docker-build-guide.md` for detailed troubleshooting
- For custom domain configuration, see `host-configuration-guide.md`

**Host Configuration:**
The application is configured for production use by default:
- **Primary domain**: `pdf.hesko.space` (default HOST_NAME)
- **Allowed hosts**: `127.0.0.1`, `localhost`, `pdf.hesko.space`, `pdf.hesko.ai`

```bash
# Production-ready (default)
make run

# Local development only
make local

# Custom domains
HOST_NAME=yourdomain.com ALLOWED_HOSTS=yourdomain.com,127.0.0.1 make run
```

### Docker (Original)
- Single container deployment
- Multi-container with separate database
- Volume mounts for persistent data

### Kubernetes
- Helm chart provided
- Configurable deployments
- Persistent volume support

### Traditional Hosting
- WSGI application
- Static file serving
- Database configuration

## Security Considerations

### Authentication
- Django's built-in authentication
- OIDC/SSO integration
- Login required middleware

### File Security
- File type validation
- User-isolated file storage
- Secure file serving

### Data Protection
- CSRF protection
- HTML sanitization (nh3)
- Secure session management

## Future Development Areas

The codebase is well-structured for extending functionality:
- Additional file format support
- Enhanced collaboration features
- API development
- Mobile application integration
- Advanced search capabilities
- Cloud storage integration

## Memories
- Add to memory