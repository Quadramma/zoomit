function test() {


	$z.create({
		canvasId: 'myCanvas',
		images: [
			'1.jpg', '2.jpg', '3.jpg'

			//			, 'wave_earth_mosaic_3.jpg'
			//,'http://www.nasa.gov/sites/default/files/wave_earth_mosaic_3.jpg'
		],
		gridLineWidth: 1,
		selectorFillStyle: 'rgba(12, 158, 255, 0.5)',
		selectorStrokeStyle: 'rgba(12, 158, 255, 0.5)',
		divisions: 5,
		selectorLineWidth: 4,
		callback: function($viewer) {
			$z.o = $viewer;
			$viewer.show();
			createControls($viewer);
			$viewer.update();
		}
	});


	function createControls($v) {
		var $help = (function() {
			var elem = document.getElementById('help');
			var o = {
				visible: true,
				toggle: function(b) {
					this.visible = b;
					if (this.visible) {
						elem.style.display = 'inherit';
					} else {
						elem.style.display = 'none';
					}
				}
			};
			var fn = snippet_evt_on(window, 'keydown', function(e) {
				var k = String.fromCharCode(e.keyCode).toUpperCase();
				if (k == 'H') {
					o.toggle(!o.visible);
				}
			});
			o.toggle(true);
			return o;
		})();
		var $arrow = (function() {
			var $self = this;
			var left = document.getElementById('arrowLeft');
			var right = document.getElementById('arrowRight');
			var canvas = document.getElementsByTagName('canvas')[0];
			var page = document.getElementById('pageCounter');
			var pageInput = document.getElementById('pageCounterInput');
			var o = {
				visible: true,
				toggle: function(b) {
					this.visible = b;
					if (this.visible) {
						left.style.display = 'inherit';
						right.style.display = 'inherit';
						page.style.display = 'inherit';
					} else {
						left.style.display = 'none';
						right.style.display = 'none';
						page.style.display = 'none';
					}
				}
			};
			var mousedownL = snippet_evt_on(left, 'mousedown', function(e) {
				$v.prev();
			});
			var mousedownR = snippet_evt_on(right, 'mousedown', function(e) {
				$v.next();
			});

			var fn = snippet_evt_on(window, 'keydown', function(e) {
				var k = String.fromCharCode(e.keyCode).toUpperCase();
				if (k == 'F') {
					o.toggle(!o.visible);
				}
				if (k == 'I') {
					if (o.visible) {
						setTimeout(function() {
							pageInput.focus();
						}, 100);
					}
				}
			});

			var fnPageInputEnter = snippet_evt_on(pageInput, 'keydown', function(e) {
				if (e.keyCode == 13) {
					$v.goto(parseInt(pageInput.value));
					pageInput.value = '';
				}
				if (isNaN(pageInput.value)) {
					pageInput.value = '';
					pageInput.blur();
				}
			});

			var fnEnd = snippet_evt_on(canvas, 'viewer_update_end', function(e) {
				if (o.visible) {
					left.style.left = canvas.offsetLeft + 'px';
					left.style.top = canvas.offsetTop + canvas.offsetHeight / 2 - left.offsetHeight / 2 + 'px';

					right.style.top = canvas.offsetTop + canvas.offsetHeight / 2 - left.offsetHeight / 2 + 'px';
					right.style.right = '';
					right.style.left = canvas.offsetLeft + canvas.offsetWidth - right.offsetWidth + 'px';

					page.style.left = canvas.offsetLeft + canvas.offsetWidth / 2 - page.offsetWidth / 2 + 'px';
					pageInput.setAttribute('placeholder', e.p.index + 1 + '/' + e.p.imagesInMemoryLength);

					//console.log(e.p);
				}
			});
			o.toggle(true);
			return o;
		})();
	}


}