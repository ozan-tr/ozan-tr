// site.js
// Small site-level behaviors: set footer year and improve anchor scrolling fallback

(function(){
    // set current year
    var el = document.getElementById('year');
    if(el) el.textContent = new Date().getFullYear();

    // Extra anchor handling: ensure clicks on in-page anchors scroll nicely
    // (CSS `scroll-behavior: smooth` handles most cases; this ensures offset handling
    // could be added later if header becomes fixed.)
    document.addEventListener('click', function(e){
        var a = e.target.closest('a[href^="#"]');
        if(!a) return;
        var href = a.getAttribute('href');
        if(!href || href === '#') return;
        var target = document.querySelector(href);
        if(target){
            e.preventDefault();
            target.scrollIntoView({behavior:'smooth', block:'start'});
        }
    }, false);
})();
