/* ============================================
   BestRest — Menu Book JavaScript
   ============================================ */

(function () {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const SECTIONS = [
        {
            number: '00',
            title: '',
            subtitle: 'Добро пожаловать',
            label: 'Главная'
        },
        {
            number: '01',
            title: 'Закуски',
            subtitle: 'Appetizers',
            label: 'Закуски'
        },
        {
            number: '02',
            title: 'Салаты',
            subtitle: 'Salads',
            label: 'Салаты'
        },
        {
            number: '03',
            title: 'Основные блюда',
            subtitle: 'Main Courses',
            label: 'Основные'
        },
        {
            number: '04',
            title: 'Паста',
            subtitle: 'Pasta',
            label: 'Паста'
        },
        {
            number: '05',
            title: 'Десерты',
            subtitle: 'Desserts',
            label: 'Десерты'
        },
        {
            number: '06',
            title: 'Напитки',
            subtitle: 'Beverages',
            label: 'Напитки'
        },
        {
            number: '07',
            title: 'Контакты',
            subtitle: 'Связь с нами',
            label: 'Контакты'
        }
    ];

    const SWIPE_THRESHOLD = 30;

    // ============================================
    // STATE
    // ============================================
    let currentIndex = 0;
    const totalPages = SECTIONS.length;
    let isAnimating = false;

    // ============================================
    // DOM REFS
    // ============================================
    const pages = document.querySelectorAll('.book-page');
    const sectionNumber = document.getElementById('sectionNumber');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    const progressBar = document.getElementById('progressBar');
    const currentPageLabel = document.getElementById('currentPage');
    const totalPagesLabel = document.getElementById('totalPages');
    const pageLabelsContainer = document.getElementById('pageLabels');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const keyboardHint = document.getElementById('keyboardHint');

    // ============================================
    // INIT
    // ============================================
    function init() {
        totalPagesLabel.textContent = totalPages;
        buildPageLabels();
        updatePage(0, true);
        bindEvents();
        
        // Hide keyboard hint after a few seconds
        setTimeout(() => {
            if (keyboardHint) {
                keyboardHint.style.opacity = '0';
                keyboardHint.style.pointerEvents = 'none';
            }
        }, 5000);
    }

    // ============================================
    // BUILD PAGE LABELS
    // ============================================
    function buildPageLabels() {
        pageLabelsContainer.innerHTML = '';
        SECTIONS.forEach((section, index) => {
            const label = document.createElement('button');
            label.className = 'page-label' + (index === 0 ? ' active' : '');
            label.setAttribute('aria-label', section.label);
            
            const numSpan = document.createElement('span');
            numSpan.className = 'label-num';
            numSpan.textContent = section.number;
            
            const textSpan = document.createElement('span');
            textSpan.className = 'label-text';
            textSpan.textContent = section.label;
            
            label.appendChild(numSpan);
            label.appendChild(textSpan);
            label.dataset.index = index;
            label.addEventListener('click', () => {
                if (!isAnimating && index !== currentIndex) {
                    navigateTo(index);
                }
            });
            pageLabelsContainer.appendChild(label);
        });
    }

    // ============================================
    // UPDATE SIDEBAR & UI
    // ============================================
    function updateSidebar(index) {
        const section = SECTIONS[index];
        
        // Animate number change
        sectionNumber.style.transform = 'translateY(-10px)';
        sectionNumber.style.opacity = '0';
        sectionTitle.style.transform = 'translateY(-8px)';
        sectionTitle.style.opacity = '0';
        sectionSubtitle.style.transform = 'translateY(-6px)';
        sectionSubtitle.style.opacity = '0';
        
        setTimeout(() => {
            sectionNumber.textContent = section.number;
            sectionTitle.textContent = section.title;
            sectionSubtitle.textContent = section.subtitle;
            
            // Hide/show section divider and title based on content
            const hasTitle = section.title && section.title.trim() !== '';
            sectionTitle.style.display = hasTitle ? 'block' : 'none';
            
            sectionNumber.style.transform = 'translateY(0)';
            sectionNumber.style.opacity = '1';
            sectionTitle.style.transform = 'translateY(0)';
            sectionTitle.style.opacity = '1';
            sectionSubtitle.style.transform = 'translateY(0)';
            sectionSubtitle.style.opacity = '1';
        }, 200);
    }

    function updateProgress(index) {
        const percent = ((index + 1) / totalPages) * 100;
        progressBar.style.width = percent + '%';
        currentPageLabel.textContent = index + 1;
    }

    function updateLabels(index) {
        const labels = pageLabelsContainer.querySelectorAll('.page-label');
        labels.forEach((label, i) => {
            label.classList.toggle('active', i === index);
        });
    }

    function updateButtons(index) {
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === totalPages - 1;
    }

    // ============================================
    // PAGE NAVIGATION
    // ============================================
    function navigateTo(newIndex, instant) {
        if (isAnimating && !instant) return;
        if (newIndex < 0 || newIndex >= totalPages) return;
        
        isAnimating = !instant;
        const goingForward = newIndex > currentIndex;
        const oldIndex = currentIndex;
        currentIndex = newIndex;

        // Update page classes for flip animation
        pages.forEach((page, i) => {
            page.classList.remove('active', 'prev', 'next');
            
            if (i === newIndex) {
                page.classList.add('active');
            } else if (i === oldIndex) {
                page.classList.add(goingForward ? 'prev' : 'next');
            }
        });

        // Update UI
        updateSidebar(newIndex);
        updateProgress(newIndex);
        updateLabels(newIndex);
        updateButtons(newIndex);

        // Re-trigger menu item animations
        animateMenuItems(newIndex);

        // Reset animation lock
        if (!instant) {
            setTimeout(() => {
                isAnimating = false;
                // Clean up old page classes after animation
                pages.forEach((page, i) => {
                    if (i !== newIndex) {
                        page.classList.remove('prev', 'next');
                    }
                });
            }, 650);
        }
    }

    function animateMenuItems(pageIndex) {
        const page = pages[pageIndex];
        if (!page) return;
        
        const items = page.querySelectorAll('.menu-item');
        items.forEach((item, i) => {
            item.style.animation = 'none';
            item.style.opacity = '0';
            void item.offsetHeight; // trigger reflow
            item.style.animation = `fadeIn 0.5s ease ${0.1 + i * 0.1}s forwards`;
        });
    }

    function goNext() {
        if (!isAnimating && currentIndex < totalPages - 1) {
            navigateTo(currentIndex + 1);
        }
    }

    function goPrev() {
        if (!isAnimating && currentIndex > 0) {
            navigateTo(currentIndex - 1);
        }
    }

    // ============================================
    // EVENTS
    // ============================================
    function updatePage(index, instant) {
        // Initial setup without animation
        pages.forEach((page, i) => {
            page.classList.remove('active', 'prev', 'next');
            if (i === index) {
                page.classList.add('active');
            }
        });
        
        updateSidebar(index);
        updateProgress(index);
        updateLabels(index);
        updateButtons(index);
        animateMenuItems(index);
        
        currentIndex = index;
    }

    function bindEvents() {
        // Button navigation
        prevBtn.addEventListener('click', goPrev);
        nextBtn.addEventListener('click', goNext);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                goPrev();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                goNext();
            } else if (e.key === 'Home') {
                e.preventDefault();
                navigateTo(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                navigateTo(totalPages - 1);
            }
        });

        // Touch / Swipe support
        let touchStartX = 0;
        let touchStartY = 0;
        let touchMaxDy = 0;
        let touchActive = false;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            touchMaxDy = 0;
            touchActive = true;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!touchActive) return;
            const cx = e.changedTouches[0].screenX;
            const cy = e.changedTouches[0].screenY;
            const dx = Math.abs(cx - touchStartX);
            const dy = Math.abs(cy - touchStartY);
            touchMaxDy = Math.max(touchMaxDy, dy);
            if (dx > dy && dx > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!touchActive) return;
            touchActive = false;
            const diffX = touchStartX - e.changedTouches[0].screenX;
            // Only trigger swipe if horizontal distance exceeds threshold
            // AND vertical movement wasn't dominant (prevents trigger after scroll)
            if (Math.abs(diffX) > SWIPE_THRESHOLD && touchMaxDy < Math.abs(diffX) * 1.5) {
                if (diffX > 0) goNext();
                else goPrev();
            }
        }, { passive: true });

        // Mouse wheel navigation (with debounce)
        let wheelTimeout = null;
        content.addEventListener('wheel', (e) => {
            // Only handle if wheel is primarily horizontal or if shift is held
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
                e.preventDefault();
                if (wheelTimeout) return;
                wheelTimeout = setTimeout(() => {
                    wheelTimeout = null;
                }, 700);
                
                if (e.deltaX > 0 || e.deltaY > 0) {
                    goNext();
                } else {
                    goPrev();
                }
            }
        }, { passive: false });

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Recalculate if needed
            }, 200);
        });
    }

    // ============================================
    // START
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
