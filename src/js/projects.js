(function () {
    'use strict';

    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('article.project-card'));
    const filterContainer = document.getElementById('tag-filters');
    const buttons = filterContainer
        ? Array.from(filterContainer.querySelectorAll('.tag-filter-btn'))
        : [];
    const status = document.getElementById('filter-status');
    const empty = document.getElementById('filter-empty');

    function packCards() {
        const layout = getComputedStyle(grid);
        const columnCount = layout.gridTemplateColumns.split(' ').length;
        if (columnCount < 2) return;

        const gap = parseFloat(layout.rowGap);
        const nextTop = Array(columnCount).fill(0);
        const visibleCards = cards.filter(card => !card.hidden);
        const heights = visibleCards.map(card => card.getBoundingClientRect().height);

        visibleCards.forEach(function (card, index) {
            const top = Math.min(...nextTop);
            const column = nextTop.indexOf(top);
            card.style.setProperty('--project-position', '1 / ' + (column + 1));
            card.style.setProperty('--project-offset', top + 'px');
            nextTop[column] = top + heights[index] + gap;
        });
    }

    if ('ResizeObserver' in window) {
        packCards();
        const observer = new ResizeObserver(packCards);
        cards.forEach(card => observer.observe(card, { box: 'border-box' }));
    }

    function setCategory(category) {
        let visibleCount = 0;

        cards.forEach(function (card) {
            const categories = (card.dataset.category || '')
                .split(',')
                .map(function (value) { return value.trim().toLowerCase(); });
            const matches = category === 'all' || categories.includes(category);

            card.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        buttons.forEach(function (button) {
            const active = button.dataset.category === category;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });

        if (status) {
            status.textContent = category === 'all'
                ? 'Showing ' + visibleCount + (visibleCount === 1 ? ' project' : ' projects')
                : 'Showing ' + visibleCount + ' of ' + cards.length + ' projects';
        }
        if (empty) empty.hidden = visibleCount > 0;
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            setCategory(button.dataset.category || 'all');
        });
    });

    function getHashTarget(hash) {
        if (!hash || hash === '#') return null;
        try {
            return document.getElementById(decodeURIComponent(hash.slice(1)));
        } catch (error) {
            return null;
        }
    }

    function revealTarget(target) {
        if (!target) return false;

        const card = target.closest('article.project-card');
        if (!card || !grid.contains(card)) return false;

        let changed = false;
        if (card.hidden) {
            setCategory('all');
            changed = true;
        }

        let details = target.closest('details');
        while (details && card.contains(details)) {
            if (!details.open) {
                details.open = true;
                changed = true;
            }
            details = details.parentElement
                ? details.parentElement.closest('details')
                : null;
        }

        if (changed && 'ResizeObserver' in window) packCards();
        return changed;
    }

    function revealCurrentHash() {
        const target = getHashTarget(window.location.hash);
        if (revealTarget(target)) {
            window.requestAnimationFrame(function () {
                target.scrollIntoView({ block: 'start' });
            });
        }
    }

    document.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const link = event.target.closest('a[href^="#"]');
        if (link) revealTarget(getHashTarget(link.getAttribute('href')));
    });

    setCategory('all');
    window.addEventListener('hashchange', revealCurrentHash);
    revealCurrentHash();
})();
