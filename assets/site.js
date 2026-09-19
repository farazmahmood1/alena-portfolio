/* Codilated site-wide behaviour, loaded (deferred) on every page after the
   theme and the per-page Lenis setup. */
(function () {
	'use strict';

	var holder = document.getElementById('content-holder');

	/* Lenis measures <html> to know how far the page scrolls, but the page
	   lives in an absolutely positioned #content-holder, so <html> never grows.
	   When images, galleries or accordions add height after load, Lenis keeps
	   the old limit and the wheel stops short of the bottom. Re-measure (and
	   re-sync ScrollTrigger) whenever the real content changes height. */
	function watchContentHeight() {
		if (!holder || !window.ResizeObserver) return;
		var lastHeight = -1, frame = 0, refreshTimer = 0;
		var observer = new ResizeObserver(function () {
			var height = holder.scrollHeight;
			if (Math.abs(height - lastHeight) < 1) return;
			lastHeight = height;
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(function () {
				if (typeof lenis === 'undefined') return;
				// dimensions.resize() re-measures without cancelling an in-flight scroll.
				if (lenis.dimensions && lenis.dimensions.resize) lenis.dimensions.resize();
				else lenis.resize();
			});
			clearTimeout(refreshTimer);
			refreshTimer = setTimeout(function () {
				if (window.ScrollTrigger) ScrollTrigger.refresh();
			}, 250);
		});
		holder.querySelectorAll('.transition-wrap').forEach(function (el) {
			observer.observe(el);
		});
	}

	/* Sections with rounded top corners open up as they scroll in: the clip
	   starts inset from the sides with a deeper radius and widens to full
	   width while the content rises into place. Clip-path leaves layout
	   untouched, so other ScrollTriggers measure the same as before. */
	function revealRoundedSections() {
		if (!window.gsap || !window.ScrollTrigger) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		var sections = document.querySelectorAll(
			'section.content-block.border-top, section.content-block.border-both'
		);
		sections.forEach(function (section) {
			if (section.matches('.hero-container, .hero-blog-container')) return;
			var content = section.querySelector(':scope > .container');

			function render(progress) {
				if (progress >= 1) {
					section.style.clipPath = '';
					if (content) content.style.transform = '';
					return;
				}
				var style = getComputedStyle(section);
				var radiusTop = parseFloat(style.borderTopLeftRadius) || 0;
				var radiusBottom = parseFloat(style.borderBottomLeftRadius) || 0;
				var mobile = window.innerWidth < 768;
				// Quadratic ease-out: keeps the widening visible until mid-screen.
				var rest = Math.pow(1 - progress, 2);
				var side = (rest * (mobile ? 4 : 8)).toFixed(3) + '%';
				var top = (radiusTop * (1 + rest * 1.5)).toFixed(1) + 'px';
				var bottom = radiusBottom.toFixed(1) + 'px';
				section.style.clipPath =
					'inset(0 ' + side + ' 0 ' + side + ' round ' + top + ' ' + top + ' ' + bottom + ' ' + bottom + ')';
				if (content) {
					content.style.transform = 'translate3d(0,' + (rest * (mobile ? 30 : 60)).toFixed(1) + 'px,0)';
				}
			}

			var trigger = ScrollTrigger.create({
				trigger: section,
				start: 'top bottom',
				end: 'top 30%',
				onUpdate: function (self) { render(self.progress); },
				onRefresh: function (self) { render(self.progress); }
			});
			render(trigger.progress);
		});
	}

	/* The theme's page-transition click handler strips the trailing slash from
	   every link before navigating, which turns the homepage link "/" into ""
	   and just reloads the current page (the header logo, the 404 home link).
	   Keep the root path intact so those links reach the homepage. */
	function keepHomeLinksWorking() {
		if (typeof s4 === 'undefined' || !s4.helper || typeof s4.helper.getUrl !== 'function') return;
		var getUrl = s4.helper.getUrl;
		s4.helper.getUrl = function () {
			var url = getUrl.apply(this, arguments);
			if (url && url.new && url.new.full === '') url.new.full = '/';
			return url;
		};
	}

	function init() {
		keepHomeLinksWorking();
		watchContentHeight();
		revealRoundedSections();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
