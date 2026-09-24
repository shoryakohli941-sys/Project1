// LinkUp — shared UI motion (no PocketBase code here)
(function () {
    var root = document.documentElement;
    root.classList.add("js");

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Scroll reveal, staggered among sibling reveals
    var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    reveals.forEach(function (el) {
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
            return c.hasAttribute("data-reveal");
        });
        var i = sibs.indexOf(el);
        if (i > 0) el.style.setProperty("--d", Math.min(i, 6));
    });

    var showAll = function () { reveals.forEach(function (el) { el.classList.add("is-in"); }); };

    if (reduce || !("IntersectionObserver" in window) || document.visibilityState === "hidden") {
        showAll();
    } else {
        // Above-the-fold content never waits on the observer
        var showVisible = function () {
            reveals.forEach(function (el) {
                if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
            });
        };
        if (window.requestAnimationFrame) window.requestAnimationFrame(showVisible); else showVisible();
        var ioFired = false;
        var io = new IntersectionObserver(function (entries) {
            ioFired = true;
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
        reveals.forEach(function (el) { io.observe(el); });
        // Safety net: if the observer never runs (embedded/background views), show everything
        setTimeout(function () { if (!ioFired) showAll(); }, 1800);
    }
    window.addEventListener("beforeprint", showAll);

    // Header hairline once scrolled
    var header = document.querySelector(".site-header");
    if (header) {
        var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Scroll parallax on 3D stacks (--p from -1 to 1)
    var parallax = document.querySelectorAll("[data-parallax]");
    if (parallax.length && !reduce) {
        var ticking = false;
        var update = function () {
            parallax.forEach(function (el) {
                var r = el.getBoundingClientRect();
                var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
                el.style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(3));
            });
            ticking = false;
        };
        window.addEventListener("scroll", function () {
            if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    // Gentle pointer tilt
    if (!reduce && finePointer) {
        document.querySelectorAll("[data-tilt]").forEach(function (el) {
            var max = parseFloat(el.getAttribute("data-tilt")) || 5;
            el.addEventListener("pointermove", function (e) {
                var r = el.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - 0.5;
                var y = (e.clientY - r.top) / r.height - 0.5;
                el.style.setProperty("--rx", (-y * max).toFixed(2) + "deg");
                el.style.setProperty("--ry", (x * max * 1.2).toFixed(2) + "deg");
            });
            el.addEventListener("pointerleave", function () {
                el.style.setProperty("--rx", "0deg");
                el.style.setProperty("--ry", "0deg");
            });
        });
    }

    // Dateline
    document.querySelectorAll("[data-today]").forEach(function (el) {
        el.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    });
})();
