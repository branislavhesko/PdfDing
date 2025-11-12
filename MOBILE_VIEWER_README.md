# PdfDing Mobile Viewer Implementation

## Overview

A separate mobile-optimized PDF viewer has been created for PdfDing, providing a touch-friendly, streamlined interface specifically designed for smartphones and tablets.

## What Was Created

### 1. Backend Components

#### View Class: `MobileViewerView`
- **File**: `pdfding/pdf/views/pdf_views.py` (lines 525-559)
- **Purpose**: Serves the mobile viewer template with the same backend logic as the desktop viewer
- **Features**:
  - View counter tracking
  - Page position memory
  - Theme support
  - Wake lock support (keep screen awake)

#### URL Routing
- **File**: `pdfding/pdf/urls.py` (line 24)
- **Route**: `/pdf/view_mobile/<identifier>`
- **Name**: `view_pdf_mobile`
- **Usage**: Access any PDF in mobile viewer by changing the URL from `/pdf/view/` to `/pdf/view_mobile/`

### 2. Frontend Components

#### Mobile Template: `viewer_mobile.html`
- **Location**: `pdfding/pdf/templates/viewer_mobile.html`
- **Size**: ~450 lines
- **Based on**: PDF.js v5.0.375 viewer template
- **Key Differences from Desktop**:
  - Mobile-first viewport settings (`user-scalable=yes`, `maximum-scale=5`)
  - Progressive Web App meta tags
  - Bottom sheet sidebar instead of fixed left sidebar
  - Compact top toolbar with essential controls
  - Bottom navigation bar with page controls
  - Mobile action menu (hamburger-style)
  - Touch-optimized dialogs and modals

#### Mobile Stylesheet: `pdf_viewer_mobile.css`
- **Location**: `pdfding/static/css/pdf_viewer_mobile.css`
- **Size**: ~680 lines
- **Features**:
  - Touch-friendly tap targets (minimum 44px)
  - Bottom sheet animations for sidebar
  - Slide-up menu animations
  - Responsive breakpoints (< 375px, 768px+, landscape)
  - Dark mode enhancements
  - Optimized scrolling performance
  - Mobile-specific color theming

#### Mobile JavaScript: `viewer_mobile.js`
- **Location**: `pdfding/static/js/pdfding/viewer_mobile.js`
- **Size**: ~520 lines
- **Features**:
  - **Touch Gestures**:
    - Swipe left/right for page navigation
    - Double-tap to zoom in/out
    - Pinch-to-zoom (native PDF.js support)
  - **Auto-hide Toolbar**: Hides when scrolling down, shows when scrolling up
  - **Mobile Menu**: Full-screen action menu for editing tools
  - **Bottom Sheet Sidebar**: Animated thumbnails/outline panel
  - **Mobile Findbar**: Touch-optimized search interface
  - **Orientation Change Handling**: Adapts layout on rotation

### 3. Backup Files

All original viewer files have been backed up:
- `pdfding/pdf/templates/backup/viewer.html.backup`
- `pdfding/static/css/backup/pdf_viewer.css.backup`
- `pdfding/static/js/pdfding/backup/viewer_base.js.backup`
- `pdfding/static/js/pdfding/backup/viewer_logged_in.js.backup`

## Key Features

### Mobile UI Components

1. **Compact Top Toolbar**
   - Back/Menu button
   - Current page indicator with direct input
   - Document title (centered)
   - Search and more options buttons

2. **Bottom Navigation Bar**
   - Previous/Next page buttons (large touch targets)
   - Zoom controls (out, select, in)
   - Always accessible navigation

3. **Bottom Sheet Sidebar**
   - Slides up from bottom with animation
   - Tabs for Thumbnails and Table of Contents
   - Swipe handle for intuitive interaction
   - Overlay backdrop for focus

4. **Mobile Action Menu**
   - Full-screen modal with overlay
   - Large touch-friendly menu items with icons
   - Editing tools (highlight, text, draw, signature)
   - Document actions (fullscreen, download, print)

5. **Touch-Optimized Search**
   - Mobile keyboard optimized
   - Large buttons for previous/next/close
   - Inline results highlighting

### Touch Interactions

- **Swipe Navigation**: Swipe left for next page, right for previous
- **Double-Tap Zoom**: Quick zoom in/out gesture
- **Auto-Hide Toolbars**: Immersive reading with scroll-to-hide UI
- **Touch-Friendly Buttons**: All interactive elements are minimum 44px
- **Smooth Animations**: Native-feeling transitions and gestures

### Responsive Design

- **Small Phones** (< 375px): Compact UI with smaller controls
- **Standard Phones** (375px - 768px): Optimized mobile experience
- **Tablets** (> 768px): Larger thumbnails and more spacious layout
- **Landscape Mode**: Adjusted heights for horizontal viewing

## Usage

### For Users

1. **Access Mobile Viewer**:
   - Change URL from `/pdf/view/<pdf-id>` to `/pdf/view_mobile/<pdf-id>`
   - Example: `/pdf/view_mobile/abc123`

2. **Navigation**:
   - Tap page numbers in toolbar to jump to specific page
   - Use bottom navigation buttons
   - Swipe left/right on PDF pages
   - Tap menu button for thumbnails/outline

3. **Editing** (Authenticated Users):
   - Tap "More options" (⋮) button in top-right
   - Select annotation tool from menu
   - Use touch to draw, highlight, or add text
   - Changes auto-save every 3 seconds

4. **Zoom**:
   - Use bottom bar zoom buttons
   - Double-tap on page to zoom
   - Pinch gesture for precise zoom
   - Select preset zoom level from dropdown

### For Developers

#### Automatic Device Detection (Future Enhancement)

To automatically route mobile devices to the mobile viewer, add this to `ViewerView.get()`:

```python
def get(self, request: HttpRequest, identifier: str):
    # Detect mobile device
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
    is_mobile = any(device in user_agent for device in ['mobile', 'android', 'iphone', 'ipad'])

    if is_mobile:
        return MobileViewerView().get(request, identifier)

    # ... rest of desktop viewer code
```

#### Adding Mobile-Specific Features

The mobile JavaScript exposes global functions:

```javascript
// Access mobile UI controls
window.PdfDingMobile.toggleSidebar();
window.PdfDingMobile.openSidebar();
window.PdfDingMobile.closeSidebar();
window.PdfDingMobile.toggleMenu();
window.PdfDingMobile.closeMenu();
window.PdfDingMobile.toggleFindbar();
window.PdfDingMobile.closeFindbar();
```

#### Customizing Touch Gestures

Edit `viewer_mobile.js` to adjust:
- `mobileUI.swipeThreshold`: Minimum swipe distance (default: 50px)
- Double-tap timing: Currently 300ms between taps
- Auto-hide delay: Toolbar reappears after 1500ms of no scrolling

## Technical Architecture

### Component Stack

```
┌─────────────────────────────────────┐
│  viewer_mobile.html (Template)      │
│  - Mobile-first HTML structure      │
└───────────┬─────────────────────────┘
            │
            ├─> PDF.js v5.0.375 (Core Rendering)
            │   - pdf.mjs
            │   - viewer.mjs
            │
            ├─> viewer_base.js (Shared)
            │   - PDF.js initialization
            │   - Common viewer setup
            │
            ├─> viewer_logged_in.js (Shared)
            │   - Authentication features
            │   - Auto-save annotations
            │   - Wake lock API
            │
            ├─> viewer_mobile.js (New)
            │   - Touch gesture handlers
            │   - Mobile UI controls
            │   - Auto-hide toolbar logic
            │
            └─> pdf_viewer_mobile.css (New)
                - Mobile-specific styling
                - Touch-optimized layout
                - Responsive breakpoints
```

### Data Flow

1. **User Request**: `/pdf/view_mobile/<identifier>`
2. **Backend**: `MobileViewerView.get()` processes request
3. **Context**: PDF metadata, theme, page number passed to template
4. **Template**: Renders mobile-optimized HTML structure
5. **PDF.js**: Loads and renders PDF document
6. **Mobile JS**: Initializes touch handlers and mobile UI
7. **Interactions**: Touch events → JavaScript handlers → PDF.js API

## Performance Optimizations

### Mobile-Specific

- **Smaller Touch Targets**: Reduced DOM complexity for faster rendering
- **Lazy Loading**: Thumbnails and outline load on-demand
- **CSS `will-change`**: Hardware acceleration for scrolling
- **Passive Event Listeners**: Non-blocking touch handlers
- **Simplified Toolbar**: Fewer buttons = less layout computation

### Shared with Desktop

- PDF.js native optimizations
- Canvas rendering with worker threads
- Progressive page loading
- Text layer virtualization

## Browser Support

- **iOS Safari**: 12+
- **Chrome Mobile**: 80+
- **Firefox Mobile**: 80+
- **Samsung Internet**: 12+
- **Opera Mobile**: 60+

### Required APIs

- Touch Events (universal support)
- Wake Lock API (optional, progressive enhancement)
- CSS Custom Properties (universal in modern browsers)
- Flexbox & CSS Grid (universal)

## Testing Checklist

- [ ] Page navigation (swipe, buttons, input)
- [ ] Zoom controls (buttons, double-tap, pinch)
- [ ] Sidebar (open, close, thumbnails, outline)
- [ ] Search functionality
- [ ] Annotation tools (highlight, text, draw, signature)
- [ ] Menu actions (download, print, fullscreen)
- [ ] Auto-hide toolbar behavior
- [ ] Theme switching (light, dark, system)
- [ ] Orientation changes (portrait ↔ landscape)
- [ ] Keyboard interactions (page input, search input)
- [ ] Touch target sizes (minimum 44px)
- [ ] Small screens (< 375px)
- [ ] Tablets (> 768px)

## Future Enhancements

### Planned Improvements

1. **Progressive Web App**
   - Add service worker for offline viewing
   - Install prompt for home screen
   - App manifest for native-like experience

2. **Gesture Enhancements**
   - Long-press context menu
   - Two-finger swipe for sidebar toggle
   - Edge swipe for back navigation

3. **Performance**
   - Lazy-load PDF.js modules
   - Reduce JavaScript bundle size
   - Optimize annotation rendering

4. **Accessibility**
   - ARIA labels for screen readers
   - Keyboard navigation fallbacks
   - High contrast mode support

5. **Smart Features**
   - Reading progress indicator
   - Smart zoom to text regions
   - Annotation quick actions (floating toolbar)

## Troubleshooting

### Common Issues

1. **Swipe gestures not working**
   - Check touch event listeners in browser console
   - Verify `viewer_mobile.js` is loaded
   - Ensure no conflicting touch handlers

2. **Toolbar doesn't auto-hide**
   - Check `setupAutoHideToolbar()` initialization
   - Verify scroll events on `#viewerContainer`
   - Inspect CSS transitions on toolbar elements

3. **Sidebar won't open**
   - Verify `mobile-sidebar` class is present
   - Check z-index conflicts in CSS
   - Ensure `sidebarContainer` element exists

4. **Zoom controls not responding**
   - Verify PDF.js `PDFViewerApplication` is initialized
   - Check browser console for JavaScript errors
   - Test with different zoom values

5. **Theme colors not applying**
   - Verify Django template context includes `theme_color`
   - Check CSS custom properties in browser DevTools
   - Ensure RGB format matches expected pattern

## Contributing

When modifying the mobile viewer:

1. **Test on real devices** - Emulators don't accurately simulate touch
2. **Maintain touch target sizes** - Minimum 44x44px for accessibility
3. **Keep animations smooth** - Target 60fps, use CSS transforms
4. **Preserve desktop viewer** - Don't modify shared components without testing both
5. **Document changes** - Update this README with new features

## License

The mobile viewer is part of PdfDing and inherits its license. PDF.js components remain under the Apache License 2.0.

---

## Quick Reference

### Files Modified
- ✅ `pdfding/pdf/views/pdf_views.py` - Added `MobileViewerView` class
- ✅ `pdfding/pdf/urls.py` - Added mobile viewer URL route

### Files Created
- ✅ `pdfding/pdf/templates/viewer_mobile.html` - Mobile template
- ✅ `pdfding/static/css/pdf_viewer_mobile.css` - Mobile styles
- ✅ `pdfding/static/js/pdfding/viewer_mobile.js` - Mobile JavaScript

### Files Backed Up
- ✅ `pdfding/pdf/templates/backup/viewer.html.backup`
- ✅ `pdfding/static/css/backup/pdf_viewer.css.backup`
- ✅ `pdfding/static/js/pdfding/backup/viewer_base.js.backup`
- ✅ `pdfding/static/js/pdfding/backup/viewer_logged_in.js.backup`

### URL Endpoints
- Desktop: `/pdf/view/<identifier>`
- Mobile: `/pdf/view_mobile/<identifier>`
- Shared (desktop): `/shared/<identifier>`
- Shared (mobile): *Future enhancement - add `MobileViewShared` view*

---

**Created**: 2025-11-12
**PdfDing Version**: Compatible with Django 5.1.7, PDF.js 5.0.375
**Author**: Claude Code (Anthropic)
