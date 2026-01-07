
(function () {
    'use strict';

    // Tag filter UI: toggle tag buttons and show/hide project cards
    const filterContainer = document.getElementById('tag-filters');
    if (filterContainer) {
        const buttons = Array.from(filterContainer.querySelectorAll('.tag-filter-btn'));
        const clearBtn = document.getElementById('clear-tags');
        const projectGrid = document.getElementById('projects-grid');
        const cards = projectGrid ? Array.from(projectGrid.querySelectorAll('.project-card')) : [];

        const getActiveTags = () => buttons
            .filter(btn => btn.classList.contains('active'))
            .map(btn => (btn.dataset.tag || '').toLowerCase())
            .filter(Boolean);

        const updateCardVisibility = () => {
            const active = getActiveTags();
            if (active.length === 0) {
                cards.forEach(card => { card.style.display = ''; });
                return;
            }

            cards.forEach(card => {
                const tags = (card.dataset.tags || '')
                    .split(',')
                    .map(t => t.trim().toLowerCase())
                    .filter(Boolean);

                const matches = active.every(tag => tags.includes(tag));
                card.style.display = matches ? '' : 'none';
            });
        };

        buttons.forEach(btn => btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            updateCardVisibility();
        }));

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                updateCardVisibility();
            });
        }
    }

    // Expand/collapse project cards when clicking the card (but ignore links and chips)
    const grid = document.getElementById('projects-grid');
    if (grid) {
        const cards = Array.from(grid.querySelectorAll('.project-card'));

        // Calculate and apply a grid-row span for each card so other items can
        // reflow into freed space when one expands. This uses the CSS
        // `grid-auto-rows` value as the measuring unit.
        function applyGridSpans(animate = true) {
            const computed = window.getComputedStyle(grid);
            const rowHeight = parseFloat(computed.getPropertyValue('grid-auto-rows')) || 8;
            let gap = computed.getPropertyValue('gap') || computed.getPropertyValue('grid-row-gap') || '0px';
            gap = parseFloat(gap) || 0;

            // FLIP: record first positions
            const firstRects = new Map();
            cards.forEach(card => {
                if (card.style.display === 'none') return;
                firstRects.set(card, card.getBoundingClientRect());
            });

            // Apply spans (layout change)
            cards.forEach(card => {
                if (card.style.display === 'none') {
                    card.style.gridRowEnd = '';
                    return;
                }
                const height = Math.ceil(card.getBoundingClientRect().height);
                const span = Math.max(1, Math.ceil((height + gap) / (rowHeight + gap)));
                card.style.gridRowEnd = 'span ' + span;
            });

            if (!animate) return;

            // Record last positions and apply inverse transforms
            const lastRects = new Map();
            cards.forEach(card => {
                if (card.style.display === 'none') return;
                lastRects.set(card, card.getBoundingClientRect());
            });

            cards.forEach(card => {
                if (!firstRects.has(card) || !lastRects.has(card)) return;
                const first = firstRects.get(card);
                const last = lastRects.get(card);
                const dx = first.left - last.left;
                const dy = first.top - last.top;
                if (dx === 0 && dy === 0) return;

                // Apply inverse transform to start from the old position
                card.style.transition = 'none';
                card.style.transform = `translate(${dx}px, ${dy}px)`;
                // Force reflow
                card.getBoundingClientRect();

                // Then animate to natural position
                requestAnimationFrame(() => {
                    card.style.transition = 'transform 260ms cubic-bezier(.2,0,.0,1)';
                    card.style.transform = '';
                    // cleanup after transition
                    const onEnd = (ev) => {
                        if (ev.propertyName !== 'transform') return;
                        card.style.transition = '';
                        card.removeEventListener('transitionend', onEnd);
                    };
                    card.addEventListener('transitionend', onEnd);
                });
            });
        }

        // Debounce helper
        let resizeTimer = null;
        function debounceApply(){
            if(resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { applyGridSpans(); resizeTimer = null; }, 80);
        }

        // Wire up clicks to expand/collapse and recalc spans
        grid.addEventListener('click', (e) => {
            if (e.target.closest('a, .small-link, .tag-chip, .tag-filter-btn')) return;

            const card = e.target.closest('.project-card');
            if (!card) return;

            const expanded = card.classList.toggle('expanded');
            card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            // allow CSS transition to finish and images to settle
            setTimeout(() => {
                applyGridSpans();
                if (expanded) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 140);
        });

        // Recalculate when the window resizes or images/fonts load
        window.addEventListener('resize', debounceApply);
        window.addEventListener('load', () => { applyGridSpans(); });

        // When filters change we need to recalc spans; observe mutations on the grid
        const mo = new MutationObserver(() => debounceApply());
        mo.observe(grid, { attributes: true, childList: true, subtree: true });
    }
})();
