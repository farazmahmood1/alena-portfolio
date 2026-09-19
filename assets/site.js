/* Codilated site-wide behaviour, loaded (deferred) on every page after the
   theme and the per-page Lenis setup. */
(function () {
	'use strict';

	var holder = document.getElementById('content-holder');

	/* Everything the header menu shows. Edit links here; every page picks the
	   change up (bump ?v= on the site.js script tags so browsers refetch). */
	var MENU = {
		kicker: 'Connect with us',
		title: 'Turn your idea into software that earns its keep',
		email: 'info@codilated.com',
		cta: { label: "Let's talk", href: '/contact' },
		columns: [
			{
				heading: 'Navigation',
				nav: true,
				links: [
					{ label: 'Home', href: '/' },
					{ label: 'About', href: '/about' },
					{ label: 'Work', href: '/portfolio/' },
					{ label: 'Services', href: '/services/' },
					{ label: 'Insights', href: '/blog/' },
					{ label: 'Contact', href: '/contact' }
				]
			},
			{
				heading: 'Industries',
				links: [
					{ label: 'Manufacturing', href: '/portfolio/atlas-manufacturing' },
					{ label: 'Finance', href: '/portfolio/helios-capital' },
					{ label: 'Healthcare', href: '/portfolio/meridian-health' },
					{ label: 'Logistics', href: '/portfolio/northwind-logistics' },
					{ label: 'Education', href: '/portfolio/lumen-learning' },
					{ label: 'Retail & E-Commerce', href: '/portfolio/maison-clair' },
					{ label: 'Nonprofit', href: '/portfolio/openhand-foundation' },
					{ label: 'Media', href: '/portfolio/orbit-media' }
				]
			},
			{
				heading: 'Insights',
				links: [
					{ label: 'AI Automation', href: '/category/ai-automation' },
					{ label: 'Machine Learning', href: '/category/machine-learning' },
					{ label: 'Web Development', href: '/category/web-development' },
					{ label: 'E-Commerce', href: '/category/ecommerce' },
					{ label: 'SEO', href: '/category/seo' },
					{ label: 'Marketing', href: '/category/marketing' },
					{ label: 'Branding', href: '/category/branding' },
					{ label: 'Strategy', href: '/category/strategy' }
				]
			},
			{
				heading: 'Services',
				chevrons: true,
				links: [
					{ label: 'AI & Automation', href: '/services/ai-automation', badge: 'Trending' },
					{ label: 'Web & App Development', href: '/services/web-development' },
					{ label: 'Shopify & E-Commerce', href: '/services/shopify-ecommerce', badge: 'Popular' },
					{ label: 'WordPress Development', href: '/services/wordpress-development' },
					{ label: 'Branding & Design', href: '/services/branding-design' },
					{ label: 'Digital Marketing & SEO', href: '/services/digital-marketing' },
					{ label: 'Social Media Marketing', href: '/services/social-media-marketing' }
				]
			}
		],
		socials: [
			{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/codilated' },
			{ label: 'X (Twitter)', href: 'https://twitter.com/codilated' },
			{ label: 'GitHub', href: 'https://github.com/codilated' },
			{ label: 'Instagram', href: 'https://www.instagram.com/codilated' }
		]
	};

	var ICONS = {
		arrow: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		chevron: '<svg class="site-menu-chevron" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		mail: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><rect x="2.5" y="4.5" width="15" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 5.5l7 5 7-5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'
	};

	function escapeHtml(text) {
		return String(text).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}

	// "/services/", "/services" and "/services.html" all name the same page.
	function normalisePath(path) {
		return path.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1') || '/';
	}

	// Which top-level Navigation entry the current page belongs to.
	function currentSection(path) {
		if (/^\/services(\/|$)/.test(path)) return '/services';
		if (/^\/portfolio(\/|$)/.test(path)) return '/portfolio';
		if (/^\/(blog|category)(\/|$)/.test(path)) return '/blog';
		return path;
	}

	function buildMenu() {
		var here = normalisePath(location.pathname);
		var section = currentSection(here);
		var step = 0;
		var reveal = function (i) { return ' site-menu-reveal" style="--i:' + i + '"'; };

		var intro =
			'<div class="site-menu-intro">' +
			'<p class="site-menu-kicker' + reveal(step++) + '>' + escapeHtml(MENU.kicker) + '</p>' +
			'<p class="site-menu-title' + reveal(step++) + '>' + escapeHtml(MENU.title) + '</p>' +
			'<span class="site-menu-rule' + reveal(step++) + '></span>' +
			'<a class="site-menu-email' + reveal(step++) + ' href="mailto:' + escapeHtml(MENU.email) + '">' + ICONS.mail + escapeHtml(MENU.email) + '</a>' +
			'<a class="site-menu-button' + reveal(step++) + ' href="' + escapeHtml(MENU.cta.href) + '">' + escapeHtml(MENU.cta.label) + ICONS.arrow + '</a>' +
			'</div>';

		var columns = MENU.columns.map(function (column, c) {
			var items = column.links.map(function (link, k) {
				var path = normalisePath(link.href);
				var isCurrent = path === here || (column.nav && path !== '/' && path === section);
				return '<li class="' + reveal(c + k + 2).slice(1) + '>' +
					'<a href="' + escapeHtml(link.href) + '"' + (isCurrent ? ' aria-current="page"' : '') + '>' +
					'<span>' + escapeHtml(link.label) + '</span>' +
					(link.badge ? '<span class="site-menu-badge">' + escapeHtml(link.badge) + '</span>' : '') +
					(column.chevrons ? ICONS.chevron : '') +
					'</a></li>';
			}).join('');
			return '<nav class="site-menu-column" aria-label="' + escapeHtml(column.heading) + '">' +
				'<p class="site-menu-heading' + reveal(c + 1) + '>' + escapeHtml(column.heading) + '</p>' +
				'<ul class="site-menu-list' + (column.nav ? ' site-menu-list--nav' : '') + '">' + items + '</ul>' +
				'</nav>';
		}).join('');

		var socials = MENU.socials.map(function (social) {
			return '<li><a href="' + escapeHtml(social.href) + '" target="_blank" rel="noopener">' + escapeHtml(social.label) + '</a></li>';
		}).join('');

		var footer =
			'<div class="site-menu-footer' + reveal(8) + '>' +
			'<span>&copy; ' + new Date().getFullYear() + ' Codilated</span>' +
			'<ul class="site-menu-socials">' + socials + '</ul>' +
			'</div>';

		var menu = document.createElement('div');
		menu.className = 'site-menu';
		menu.id = 'site-menu';
		menu.setAttribute('role', 'dialog');
		menu.setAttribute('aria-modal', 'true');
		menu.setAttribute('aria-label', 'Site menu');
		menu.setAttribute('aria-hidden', 'true');
		menu.innerHTML =
			'<div class="site-menu-backdrop"></div>' +
			// data-lenis-prevent lets the panel scroll natively while Lenis is stopped.
			'<div class="site-menu-panel" data-lenis-prevent>' +
			'<div class="site-menu-inner">' + intro + columns + footer + '</div>' +
			'</div>';
		document.body.appendChild(menu);
		return menu;
	}

	/* The header's round button opens a full-screen menu. While it is open the
	   page behind is locked, Escape or the button closes it, and keyboard focus
	   stays inside the header button and the menu. */
	function setUpMenu() {
		var toggle = document.querySelector('.site-menu-toggle');
		if (!toggle) return;
		var menu = buildMenu();
		var root = document.documentElement;
		var navbar = document.querySelector('.semplice-navbar');
		var panel = menu.querySelector('.site-menu-panel');
		var isOpen = false;

		function focusables() {
			return [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll('a[href]')));
		}

		function open() {
			if (isOpen) return;
			isOpen = true;
			var navHeight = navbar ? navbar.getBoundingClientRect().height : 0;
			if (navHeight) root.style.setProperty('--site-header-height', navHeight + 'px');
			root.style.setProperty('--site-scrollbar', (window.innerWidth - root.clientWidth) + 'px');
			panel.scrollTop = 0;
			if (typeof lenis !== 'undefined') lenis.stop();
			root.classList.add('site-menu-open');
			menu.setAttribute('aria-hidden', 'false');
			toggle.setAttribute('aria-expanded', 'true');
			toggle.setAttribute('aria-label', 'Close menu');
		}

		function close(returnFocus) {
			if (!isOpen) return;
			isOpen = false;
			root.classList.remove('site-menu-open');
			menu.setAttribute('aria-hidden', 'true');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.setAttribute('aria-label', 'Open menu');
			if (typeof lenis !== 'undefined') lenis.start();
			if (returnFocus) toggle.focus();
		}

		toggle.addEventListener('click', function () {
			if (isOpen) close(false); else open();
		});

		// Clicking the dimmed strip around the panel closes the menu.
		menu.querySelector('.site-menu-backdrop').addEventListener('click', function () { close(false); });

		// Following a link: let the theme's page transition run, but fade the
		// menu with it so it doesn't hang over the next page.
		menu.addEventListener('click', function (event) {
			var link = event.target.closest('a[href]');
			if (link && link.target !== '_blank' && link.protocol !== 'mailto:') close(false);
		});

		document.addEventListener('keydown', function (event) {
			if (!isOpen) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				close(true);
				return;
			}
			if (event.key !== 'Tab') return;
			var items = focusables();
			var index = items.indexOf(document.activeElement);
			var next = event.shiftKey
				? (index <= 0 ? items.length - 1 : index - 1)
				: (index === -1 || index === items.length - 1 ? 0 : index + 1);
			event.preventDefault();
			items[next].focus();
		});
	}

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
		setUpMenu();
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
