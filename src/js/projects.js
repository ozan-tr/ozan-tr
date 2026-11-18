(function () {
    'use strict';

    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('article.project-card'));
    const filterContainer = document.getElementById('tag-filters');
    const buttons = filterContainer
        ? Array.from(filterContainer.querySelectorAll('.tag-filter-btn'))
        : [];
    const categories = new Set(buttons.map(button => button.dataset.category));
    const status = document.getElementById('filter-status');
    const empty = document.getElementById('filter-empty');
    let layoutQueued = false;

    function setLayoutValue(card, name, value) {
        if (card.style.getPropertyValue(name) !== value) {
            card.style.setProperty(name, value);
        }
    }

    function packCards() {
        const layout = getComputedStyle(grid);
        const columnCount = layout.gridTemplateColumns.trim().split(/\s+/).length;
        if (columnCount < 2) return;

        const gap = parseFloat(layout.rowGap) || 0;
        const nextTop = Array(columnCount).fill(0);
        const visibleCards = cards.filter(card => !card.hidden);
        const heights = visibleCards.map(card => card.getBoundingClientRect().height);

        visibleCards.forEach(function (card, index) {
            const top = Math.min(...nextTop);
            const column = nextTop.indexOf(top);
            setLayoutValue(card, '--project-position', '1 / ' + (column + 1));
            setLayoutValue(card, '--project-offset', top + 'px');
            nextTop[column] = top + heights[index] + gap;
        });
    }

    function scheduleLayout() {
        if (layoutQueued) return;
        layoutQueued = true;
        window.requestAnimationFrame(function () {
            layoutQueued = false;
            packCards();
        });
    }

    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(scheduleLayout);
        cards.forEach(card => observer.observe(card, { box: 'border-box' }));
    }
    window.addEventListener('resize', scheduleLayout);
    grid.addEventListener('load', scheduleLayout, true);
    grid.addEventListener('toggle', scheduleLayout, true);

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
        packCards();
    }

    function categoryFromUrl() {
        const value = new URL(window.location.href).searchParams.get('filter');
        const category = (value || 'all').trim().toLowerCase();
        return categories.has(category) ? category : 'all';
    }

    function updateFilterUrl(category, options = {}) {
        const url = new URL(window.location.href);
        if (category === 'all') {
            url.searchParams.delete('filter');
        } else {
            url.searchParams.set('filter', category);
        }
        if (options.hash) url.hash = options.hash;
        if (url.href !== window.location.href) {
            window.history[options.replace ? 'replaceState' : 'pushState'](null, '', url.href);
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            const category = button.dataset.category || 'all';
            setCategory(category);
            updateFilterUrl(category, { hash: '#projects' });
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
            updateFilterUrl('all', { replace: true });
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

        if (changed) packCards();
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
        if (!link) return;
        const hash = link.getAttribute('href');
        const target = getHashTarget(hash);
        const card = target && target.closest('article.project-card');
        if (card && grid.contains(card) && card.hidden) {
            // Keep the previous filter in history when opening a hidden project.
            event.preventDefault();
            updateFilterUrl('all', { hash: hash });
            revealCurrentHash();
        } else {
            revealTarget(target);
        }
    });

    // The image links still open their original files when JavaScript or native
    // dialogs are unavailable. Modal behaviour is only added when supported.
    let imageDialog;
    let dialogImage;
    let dialogTitle;
    let dialogCaption;
    let dialogClose;
    let imageTrigger;

    function createImageDialog() {
        imageDialog = document.createElement('dialog');
        if (typeof imageDialog.showModal !== 'function') {
            imageDialog = null;
            return false;
        }
        imageDialog.className = 'project-image-dialog';
        imageDialog.setAttribute('aria-labelledby', 'portfolio-image-title');
        imageDialog.setAttribute('aria-describedby', 'portfolio-image-caption');

        const header = document.createElement('div');
        header.className = 'project-image-dialog-header';
        dialogTitle = document.createElement('h2');
        dialogTitle.id = 'portfolio-image-title';
        dialogClose = document.createElement('button');
        dialogClose.type = 'button';
        dialogClose.className = 'btn outline project-image-close';
        dialogClose.textContent = 'Close image';
        dialogClose.autofocus = true;
        header.append(dialogTitle, dialogClose);

        const figure = document.createElement('figure');
        dialogImage = document.createElement('img');
        dialogImage.className = 'project-image-full';
        dialogCaption = document.createElement('figcaption');
        dialogCaption.id = 'portfolio-image-caption';
        figure.append(dialogImage, dialogCaption);
        imageDialog.append(header, figure);
        document.body.append(imageDialog);

        dialogClose.addEventListener('click', function () { imageDialog.close(); });
        imageDialog.addEventListener('click', function (event) {
            if (event.target !== imageDialog) return;
            const bounds = imageDialog.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right ||
                event.clientY < bounds.top || event.clientY > bounds.bottom) {
                imageDialog.close();
            }
        });
        imageDialog.addEventListener('close', function () {
            if (imageTrigger && imageTrigger.isConnected) {
                imageTrigger.focus({ preventScroll: true });
            }
        });
        return true;
    }

    grid.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a.project-image-link');
        if (!link) return;
        const thumbnail = link.querySelector('img');
        if (!thumbnail || (!imageDialog && !createImageDialog())) return;

        event.preventDefault();
        const card = link.closest('article.project-card');
        const heading = card && card.querySelector('h3');
        const figure = link.closest('figure');
        const caption = figure && figure.querySelector('figcaption');
        imageTrigger = link;
        dialogTitle.textContent = heading ? heading.textContent.trim() : 'Project image';
        dialogImage.src = link.href;
        dialogImage.alt = thumbnail.alt;
        dialogCaption.textContent = caption ? caption.textContent.trim() : thumbnail.alt;
        imageDialog.showModal();
        dialogClose.focus();
    });

    function restoreFilterFromUrl() {
        setCategory(categoryFromUrl());
        revealCurrentHash();
    }

    window.addEventListener('popstate', restoreFilterFromUrl);
    window.addEventListener('hashchange', revealCurrentHash);
    restoreFilterFromUrl();
})();
