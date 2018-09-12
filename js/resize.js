(function(doc, win) {
				var docEl = doc.documentElement,
					resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
					recalc = function() {
						var clientWidth = docEl.clientWidth < 768 ? docEl.clientWidth : 768;
						if (!clientWidth) return;
						docEl.style.fontSize = 10 * (clientWidth / 320) + 'px';
					};
				recalc();
				if (!doc.addEventListener) return;
				win.addEventListener(resizeEvt, recalc, false);
})
(document, window);