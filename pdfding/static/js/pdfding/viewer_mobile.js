/**
 * Mobile-specific JavaScript for PdfDing PDF Viewer
 * Handles touch interactions, gestures, and mobile UI controls
 */

(function() {
  'use strict';

  // ===== MOBILE UI STATE =====
  const mobileUI = {
    sidebarOpen: false,
    menuOpen: false,
    findbarOpen: false,
    toolbarVisible: true,
    lastTap: 0,
    touchStartX: 0,
    touchStartY: 0,
    swipeThreshold: 50,
  };

  // ===== INITIALIZATION =====
  document.addEventListener('DOMContentLoaded', function() {
    initializeMobileControls();
    initializeTouchGestures();
    initializeMobileMenu();
    initializeMobileSidebar();
    initializeMobileFindbar();
    setupAutoHideToolbar();
  });

  // ===== MOBILE CONTROLS =====
  function initializeMobileControls() {
    // Bottom navigation
    const prevBtn = document.getElementById('previousPage');
    const nextBtn = document.getElementById('nextPage');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const scaleSelect = document.getElementById('scaleSelect');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        PDFViewerApplication.pdfViewer.currentPageNumber--;
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        PDFViewerApplication.pdfViewer.currentPageNumber++;
      });
    }

    if (zoomIn) {
      zoomIn.addEventListener('click', () => {
        PDFViewerApplication.zoomIn();
      });
    }

    if (zoomOut) {
      zoomOut.addEventListener('click', () => {
        PDFViewerApplication.zoomOut();
      });
    }

    if (scaleSelect) {
      scaleSelect.addEventListener('change', (e) => {
        PDFViewerApplication.pdfViewer.currentScaleValue = e.target.value;
      });
    }

    // Update navigation buttons based on current page
    updateNavigationButtons();

    // Listen for page changes
    document.addEventListener('pagechanging', updateNavigationButtons);
  }

  function updateNavigationButtons() {
    const prevBtn = document.getElementById('previousPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNum = document.getElementById('pageNumber');
    const numPages = document.getElementById('numPages');

    if (PDFViewerApplication.pdfDocument) {
      const currentPage = PDFViewerApplication.pdfViewer.currentPageNumber;
      const totalPages = PDFViewerApplication.pagesCount;

      if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
      }

      if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
      }

      if (pageNum) {
        pageNum.value = currentPage;
        pageNum.max = totalPages;
      }

      if (numPages) {
        numPages.textContent = `/ ${totalPages}`;
      }
    }
  }

  // ===== MOBILE MENU =====
  function initializeMobileMenu() {
    const menuButton = document.getElementById('mobileMenuButton');
    const menu = document.getElementById('mobileActionMenu');
    const menuClose = document.getElementById('menuCloseButton');
    const menuOverlay = menu?.querySelector('.menu-overlay');

    if (menuButton && menu) {
      menuButton.addEventListener('click', () => {
        openMobileMenu();
      });
    }

    if (menuClose) {
      menuClose.addEventListener('click', () => {
        closeMobileMenu();
      });
    }

    if (menuOverlay) {
      menuOverlay.addEventListener('click', () => {
        closeMobileMenu();
      });
    }

    // Menu item handlers
    const menuItems = {
      'editorHighlight': () => {
        PDFViewerApplication.eventBus.dispatch('switchannotationeditormode', {
          mode: 9 // Highlight mode
        });
        closeMobileMenu();
      },
      'editorFreeText': () => {
        PDFViewerApplication.eventBus.dispatch('switchannotationeditormode', {
          mode: 3 // FreeText mode
        });
        closeMobileMenu();
      },
      'editorInk': () => {
        PDFViewerApplication.eventBus.dispatch('switchannotationeditormode', {
          mode: 15 // Ink mode
        });
        closeMobileMenu();
      },
      'editorStamp': () => {
        PDFViewerApplication.eventBus.dispatch('switchannotationeditormode', {
          mode: 13 // Stamp mode
        });
        closeMobileMenu();
      },
      'presentationMode': () => {
        PDFViewerApplication.requestPresentationMode();
        closeMobileMenu();
      },
      'download': () => {
        PDFViewerApplication.download();
        closeMobileMenu();
      },
      'print': () => {
        PDFViewerApplication.triggerPrinting();
        closeMobileMenu();
      }
    };

    Object.keys(menuItems).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('click', menuItems[id]);
      }
    });
  }

  function openMobileMenu() {
    const menu = document.getElementById('mobileActionMenu');
    if (menu) {
      menu.classList.remove('hidden');
      mobileUI.menuOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    const menu = document.getElementById('mobileActionMenu');
    if (menu) {
      menu.classList.add('hidden');
      mobileUI.menuOpen = false;
      document.body.style.overflow = '';
    }
  }

  // ===== MOBILE SIDEBAR (BOTTOM SHEET) =====
  function initializeMobileSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggleButton');
    const sidebar = document.getElementById('sidebarContainer');
    const sidebarClose = document.getElementById('sidebarCloseButton');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        toggleMobileSidebar();
      });
    }

    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => {
        closeMobileSidebar();
      });
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        closeMobileSidebar();
      });
    }

    // Tab switching (Thumbnails / Outline)
    const thumbnailBtn = document.getElementById('viewThumbnail');
    const outlineBtn = document.getElementById('viewOutline');
    const thumbnailView = document.getElementById('thumbnailView');
    const outlineView = document.getElementById('outlineView');

    if (thumbnailBtn && thumbnailView) {
      thumbnailBtn.addEventListener('click', () => {
        thumbnailView.classList.remove('hidden');
        outlineView.classList.add('hidden');
        thumbnailBtn.classList.add('toggled');
        outlineBtn.classList.remove('toggled');
      });
    }

    if (outlineBtn && outlineView) {
      outlineBtn.addEventListener('click', () => {
        outlineView.classList.remove('hidden');
        thumbnailView.classList.add('hidden');
        outlineBtn.classList.add('toggled');
        thumbnailBtn.classList.remove('toggled');
      });
    }
  }

  function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebarContainer');
    if (sidebar) {
      if (mobileUI.sidebarOpen) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    }
  }

  function openMobileSidebar() {
    const sidebar = document.getElementById('sidebarContainer');
    if (sidebar) {
      sidebar.classList.add('active');
      mobileUI.sidebarOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebarContainer');
    if (sidebar) {
      sidebar.classList.remove('active');
      mobileUI.sidebarOpen = false;
      document.body.style.overflow = '';
    }
  }

  // ===== MOBILE FINDBAR =====
  function initializeMobileFindbar() {
    const findButton = document.getElementById('viewFindButton');
    const findbar = document.getElementById('findbar');
    const findClose = document.getElementById('findCloseButton');
    const findInput = document.getElementById('findInput');
    const findPrev = document.getElementById('findPreviousButton');
    const findNext = document.getElementById('findNextButton');

    if (findButton && findbar) {
      findButton.addEventListener('click', () => {
        toggleMobileFindbar();
      });
    }

    if (findClose) {
      findClose.addEventListener('click', () => {
        closeMobileFindbar();
      });
    }

    if (findInput) {
      findInput.addEventListener('input', (e) => {
        PDFViewerApplication.findController.executeCommand('find', {
          query: e.target.value,
          caseSensitive: false,
          highlightAll: true,
          findPrevious: false
        });
      });
    }

    if (findPrev) {
      findPrev.addEventListener('click', () => {
        PDFViewerApplication.findController.executeCommand('findagain', {
          query: findInput.value,
          caseSensitive: false,
          findPrevious: true
        });
      });
    }

    if (findNext) {
      findNext.addEventListener('click', () => {
        PDFViewerApplication.findController.executeCommand('findagain', {
          query: findInput.value,
          caseSensitive: false,
          findPrevious: false
        });
      });
    }
  }

  function toggleMobileFindbar() {
    const findbar = document.getElementById('findbar');
    const findInput = document.getElementById('findInput');

    if (findbar) {
      if (mobileUI.findbarOpen) {
        closeMobileFindbar();
      } else {
        findbar.classList.remove('hidden');
        mobileUI.findbarOpen = true;
        if (findInput) {
          findInput.focus();
        }
      }
    }
  }

  function closeMobileFindbar() {
    const findbar = document.getElementById('findbar');
    if (findbar) {
      findbar.classList.add('hidden');
      mobileUI.findbarOpen = false;
    }
  }

  // ===== TOUCH GESTURES =====
  function initializeTouchGestures() {
    const viewerContainer = document.getElementById('viewerContainer');

    if (viewerContainer) {
      // Swipe gestures for page navigation
      viewerContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
      viewerContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

      // Double-tap to zoom
      viewerContainer.addEventListener('touchend', handleDoubleTap);

      // Pinch to zoom is handled by PDF.js by default
    }
  }

  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      mobileUI.touchStartX = e.touches[0].clientX;
      mobileUI.touchStartY = e.touches[0].clientY;
    }
  }

  function handleTouchEnd(e) {
    if (e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - mobileUI.touchStartX;
      const deltaY = touchEndY - mobileUI.touchStartY;

      // Check if it's a horizontal swipe (more horizontal than vertical)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > mobileUI.swipeThreshold) {
        if (deltaX > 0) {
          // Swipe right - previous page
          if (PDFViewerApplication.pdfViewer.currentPageNumber > 1) {
            PDFViewerApplication.pdfViewer.currentPageNumber--;
          }
        } else {
          // Swipe left - next page
          if (PDFViewerApplication.pdfViewer.currentPageNumber < PDFViewerApplication.pagesCount) {
            PDFViewerApplication.pdfViewer.currentPageNumber++;
          }
        }
      }
    }
  }

  function handleDoubleTap(e) {
    const now = Date.now();
    const timeSinceLastTap = now - mobileUI.lastTap;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      const currentScale = PDFViewerApplication.pdfViewer.currentScale;

      if (currentScale < 1.5) {
        // Zoom in
        PDFViewerApplication.pdfViewer.currentScale = 2.0;
      } else {
        // Zoom out to fit
        PDFViewerApplication.pdfViewer.currentScaleValue = 'page-width';
      }

      e.preventDefault();
    }

    mobileUI.lastTap = now;
  }

  // ===== AUTO-HIDE TOOLBAR =====
  function setupAutoHideToolbar() {
    let scrollTimeout;
    let lastScrollTop = 0;
    const toolbar = document.getElementById('mobileToolbar');
    const bottomBar = document.getElementById('mobileBottomBar');
    const viewerContainer = document.getElementById('viewerContainer');

    if (viewerContainer && toolbar && bottomBar) {
      viewerContainer.addEventListener('scroll', () => {
        const scrollTop = viewerContainer.scrollTop;
        const scrollDelta = scrollTop - lastScrollTop;

        // Show toolbars when scrolling up, hide when scrolling down
        if (scrollDelta > 5 && mobileUI.toolbarVisible) {
          // Scrolling down
          toolbar.style.transform = 'translateY(-100%)';
          bottomBar.style.transform = 'translateY(100%)';
          mobileUI.toolbarVisible = false;
        } else if (scrollDelta < -5 && !mobileUI.toolbarVisible) {
          // Scrolling up
          toolbar.style.transform = 'translateY(0)';
          bottomBar.style.transform = 'translateY(0)';
          mobileUI.toolbarVisible = true;
        }

        lastScrollTop = scrollTop;

        // Always show toolbars after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (!mobileUI.toolbarVisible) {
            toolbar.style.transform = 'translateY(0)';
            bottomBar.style.transform = 'translateY(0)';
            mobileUI.toolbarVisible = true;
          }
        }, 1500);
      });

      // Add CSS transitions
      toolbar.style.transition = 'transform 0.3s ease-out';
      bottomBar.style.transition = 'transform 0.3s ease-out';
    }
  }

  // ===== PAGE NUMBER INPUT =====
  const pageInput = document.getElementById('pageNumber');
  if (pageInput) {
    pageInput.addEventListener('change', (e) => {
      const pageNum = parseInt(e.target.value, 10);
      if (pageNum >= 1 && pageNum <= PDFViewerApplication.pagesCount) {
        PDFViewerApplication.pdfViewer.currentPageNumber = pageNum;
      } else {
        // Reset to current page if invalid
        e.target.value = PDFViewerApplication.pdfViewer.currentPageNumber;
      }
    });
  }

  // ===== ORIENTATION CHANGE HANDLER =====
  window.addEventListener('orientationchange', () => {
    // Close any open panels on orientation change
    closeMobileSidebar();
    closeMobileMenu();

    // Adjust viewer layout after orientation change
    setTimeout(() => {
      if (PDFViewerApplication.pdfViewer) {
        PDFViewerApplication.pdfViewer.update();
      }
    }, 300);
  });

  // ===== PREVENT ZOOM ON DOUBLE TAP (except on viewer) =====
  document.addEventListener('touchend', (e) => {
    const isViewerContainer = e.target.closest('#viewerContainer');
    if (!isViewerContainer) {
      // Prevent default double-tap zoom on UI elements
      const now = Date.now();
      const timeSinceLastTap = now - mobileUI.lastTap;
      if (timeSinceLastTap < 300) {
        e.preventDefault();
      }
    }
  });

  // ===== EXPORT MOBILE UI FUNCTIONS =====
  window.PdfDingMobile = {
    toggleSidebar: toggleMobileSidebar,
    openSidebar: openMobileSidebar,
    closeSidebar: closeMobileSidebar,
    toggleMenu: openMobileMenu,
    closeMenu: closeMobileMenu,
    toggleFindbar: toggleMobileFindbar,
    closeFindbar: closeMobileFindbar,
  };

})();
