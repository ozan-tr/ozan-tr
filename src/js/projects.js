// projects.js
// Handles tag filtering and project card expand/collapse behavior

(function(){
    var filterContainer = document.getElementById('tag-filters');
    if(filterContainer){
        var buttons = Array.from(filterContainer.querySelectorAll('.tag-filter-btn'));
        var clearBtn = document.getElementById('clear-tags');
        var projectGrid = document.getElementById('projects-grid');
        var cards = projectGrid ? Array.from(projectGrid.querySelectorAll('.project-card')) : [];

        function getActiveTags(){
            return buttons.filter(b=>b.classList.contains('active')).map(b=>b.dataset.tag);
        }

        function applyFilters(){
            var active = getActiveTags();
            if(active.length === 0){
                cards.forEach(c=>c.style.display='');
                return;
            }
            cards.forEach(function(card){
                var tags = (card.getAttribute('data-tags')||'').split(',').map(t=>t.trim().toLowerCase()).filter(Boolean);
                var ok = active.every(function(at){ return tags.indexOf(at.toLowerCase()) !== -1 });
                card.style.display = ok ? '' : 'none';
            });
        }

        buttons.forEach(function(btn){
            btn.addEventListener('click', function(){
                btn.classList.toggle('active');
                applyFilters();
            });
        });

        if(clearBtn){
            clearBtn.addEventListener('click', function(){
                buttons.forEach(b=>b.classList.remove('active'));
                applyFilters();
            });
        }
    }

    // Expand/collapse project card media by clicking the card container.
    // Ignore clicks on links and tag chips so those continue to work.
    (function(){
        var grid = document.getElementById('projects-grid');
        if(!grid) return;
        grid.addEventListener('click', function(e){
            if (e.target.closest('a, .small-link, .tag-chip, .tag-filter-btn')) return;

            var card = e.target.closest('.project-card');
            if(!card) return;

            var expanded = card.classList.toggle('expanded');
            card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            if(expanded){
                setTimeout(function(){ card.scrollIntoView({behavior:'smooth',block:'center'}); }, 120);
            }
        });
    })();
})();
