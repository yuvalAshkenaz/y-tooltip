(function () {
	var MARGIN = 8;
	var canvas = null;

	// Browsers with a mouse and CSS anchor positioning already keep the tooltip on the screen
	function usesAnchors() {
		return !!(window.CSS && window.CSS.supports && window.CSS.supports('position-area', 'bottom') && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
	}

	// Width of the tooltip bubble: the text width plus padding, up to the max width
	function bubbleWidth(el) {
		var style = window.getComputedStyle(el, '::after');
		var max = parseFloat(window.getComputedStyle(el).getPropertyValue('--y-tooltip-max-width')) || 176;
		var padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
		canvas = canvas || document.createElement('canvas');
		var context = canvas.getContext('2d');
		context.font = style.fontStyle + ' ' + style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
		return Math.min(max, context.measureText(el.getAttribute('data-tooltip')).width + padding);
	}

	// Horizontal span of the bubble for each alignment
	function spans(rect, width) {
		var center = rect.left + rect.width / 2;
		return {
			center: [center - width / 2, center + width / 2],
			left: [rect.left - 9, rect.left - 9 + width],
			right: [rect.right + 9 - width, rect.right + 9]
		};
	}

	// How far a span goes outside the screen
	function overflow(span, viewport) {
		return Math.max(0, MARGIN - span[0]) + Math.max(0, span[1] - (viewport - MARGIN));
	}

	// Keep the alignment you chose when it fits, otherwise use the first one that fits the screen
	function align(el) {
		if (!el.hasAttribute('data-tooltip-auto')) {
			el.setAttribute('data-tooltip-manual', el.hasAttribute('data-tooltip-left') ? 'left' : (el.hasAttribute('data-tooltip-right') ? 'right' : 'center'));
		}
		if (!el.getAttribute('data-tooltip')) {
			return;
		}
		var preferred = el.getAttribute('data-tooltip-manual');
		var order = [preferred].concat(['center', 'left', 'right'].filter(function (name) {
			return name !== preferred;
		}));
		var all = spans(el.getBoundingClientRect(), bubbleWidth(el));
		var viewport = document.documentElement.clientWidth;
		var best = preferred;
		var least = Infinity;
		for (var i = 0; i < order.length; i++) {
			var over = overflow(all[order[i]], viewport);
			if (over < least) {
				least = over;
				best = order[i];
			}
			if (over === 0) {
				break;
			}
		}
		el.removeAttribute('data-tooltip-left');
		el.removeAttribute('data-tooltip-right');
		if (best !== 'center') {
			el.setAttribute('data-tooltip-' + best, '');
		}
		el.setAttribute('data-tooltip-auto', best);
	}

	// Check the element right before its tooltip appears
	function onShow(event) {
		var target = event.target;
		var el = target && target.closest ? target.closest('[data-tooltip]') : null;
		if (el && !usesAnchors()) {
			align(el);
		}
	}

	['pointerenter', 'focusin', 'pointerdown'].forEach(function (type) {
		document.addEventListener(type, onShow, true);
	});

	window.YTooltip = { align: align };
})();
