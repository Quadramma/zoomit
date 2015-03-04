$z = {
	grid: {
		draw: function(p) {
			p._xW = p._xW || 0;
			p._xH = p._xH || 0;

			var c = p.canvas.getContext('2d');
			var x = 0,
				w = p.canvas.width,
				h = p.canvas.height,
				pw = p.divisions;
			c.beginPath();

			var r = (w / (w / pw)) + 0.5 | 0;
			p._xW = w / r;
			for (x = 0; x <= w; x += p._xW) {
				c.moveTo(x, 0);
				c.lineTo(x, h);
			}
			r = (h / (h / pw)) + 0.5 | 0;
			p._xH = h / r;
			for (x = 0; x <= h; x += p._xH) {
				c.moveTo(0, x);
				c.lineTo(w, x);
			}
			c.strokeStyle = p.gridStrokeStyle;
			p._ctx.lineWidth = p.gridLineWidth;
			c.stroke();



			(function() {
				var curr = $z._getCurrentImage(p);
				var xw = p._xW,
					xh = p._xH;
				for (var x in p.imagesInMemoryData[curr.index].zoomData) {
					if (x > 0) {
						xw = xw / p.divisions;
						xh = xh / p.divisions;
					}
				}
				p.imagesInMemoryData[curr.index].zoomData[p.imagesInMemoryData[curr.index].index].xw = xw;
				p.imagesInMemoryData[curr.index].zoomData[p.imagesInMemoryData[curr.index].index].xh = xh;
			})();



			return this;
		},
		point: function(x, y, p) {
			return {
				x: x * p._xW - p._xW / 2,
				y: y * p._xH - p._xH / 2
			};
		},
		advancePoint: function(x, y, xw, xh) {
			return {
				x: x * xw - xw / 2,
				y: y * xh - xh / 2
			};
		}
	},
	_createSelector: function(p, o) {
		var $self = this;
		var s = {};
		s.moveH = function(d) {
			var newX = p._selectorX + d;
			if (newX <= 0) {
				return;
			}
			if (newX > p.divisions) {
				return;
			}
			p._selectorX = newX;
			o.update();
		};
		s.moveY = function(d) {
			var newY = p._selectorY + d;
			if (newY <= 0) {
				return;
			}
			if (newY > p.divisions) {
				return;
			}
			p._selectorY = newY;
			o.update();
		};
		s.draw = function() {
			var point = $self.grid.point(p._selectorX, p._selectorY, p);
			p._ctx.beginPath();
			p._ctx.rect(point.x - p._xW / 2, point.y - p._xH / 2, p._xW, p._xH);
			p._ctx.fillStyle = p.selectorFillStyle;
			p._ctx.fill();
			p._ctx.lineWidth = p.selectorLineWidth;
			p._ctx.strokeStyle = p.selectorStrokeStyle;
			p._ctx.stroke();
		};
		return s;
	},
	_setDefaults: function(p) {
		p.loadingIconUrl = p.loadingIconUrl || 'loading.jpg';
		p.canvasId = p.canvasId || null;
		p.fullscreen = p.fullscreen || false;
		p.divisions = p.divisions || 5;
		p.gridStrokeStyle = p.gridStrokeStyle || 'rgba(255, 255, 255, 1)';
		p.gridLineWidth = p.gridLineWidth || 2;
		p.selectorFillStyle = p.selectorFillStyle || 'rgba(255,255,255,0.5)';
		p.selectorStrokeStyle = p.selectorStrokeStyle || 'white';
		p.selectorLineWidth = p.selectorLineWidth || 2;
		p.index = p.index || 0;
		p.imagesInMemory = null;
		if (p.canvasId !== null) {
			p.canvas = document.getElementById(p.canvasId);
		} else {
			p.canvas = document.getElementsByTagName('canvas')[0];
		}
		p._ctx = p.canvas.getContext('2d');
		p._selectorX = p._selectorX || 1;
		p._selectorY = p._selectorY || 1;
		p._xW = p._xW || 0;
		p._xH = p._xH || 0;
	},
	_createFullscreenFn: function(p, o) {
		var fn = snippet_evt_on(window, 'resize', function() {
			if (!o.isFullscreen) {
				var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
				var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
				p.canvas.setAttribute('width', w);
				p.canvas.setAttribute('height', h);
			}
			p.canvas.dispatchEvent(new Event('viewer_update'));
			//o.update();
		});
		return fn;
	},
	_rescaleCanvasProportionally: function(i, p) {
		var r = snippet_scale_restrictAuto(i.width, i.height, window.innerWidth, window.innerHeight)
		p.canvas.setAttribute('width', r.w);
		p.canvas.setAttribute('height', r.h);
	},
	_createImageViewerData: function(p, i) {
		var d = {
			zoomData: [],
			index: 0
		};
		d.zoomData.push({
			xw: p._xW,
			xh: p._xH,
			sx: 0,
			sy: 0,
			rx: 0,
			ry: 0,
			sw: i.width,
			sh: i.height
		});
		d._selectorY = p.divisions / 2 + 0.5 | 0;
		d._selectorX = p.divisions / 2 + 0.5 | 0;
		return d;
	},
	_getImageViewerZoomData: function(d, index) {
		return {
			xw: d.zoomData[index].xw,
			xh: d.zoomData[index].xh,
			sx: d.zoomData[index].sx,
			sy: d.zoomData[index].sy,
			rx: d.zoomData[index].rx,
			ry: d.zoomData[index].ry,
			sw: d.zoomData[index].sw,
			sh: d.zoomData[index].sh,
		};
	},
	_calculateGridBounds: function(p) {
		var b = {
			xw: 0,
			xh: 0
		};
		w = p.canvas.width,
			h = p.canvas.height,
			pw = p.divisions;
		var r = (w / (w / pw)) + 0.5 | 0;
		b.xw = w / r;
		r = (h / (h / pw)) + 0.5 | 0;
		b.xh = h / r;
		return b;
	},
	_drawLoadingIcon: function(p) {
		var gb = this._calculateGridBounds(p);
		var point = this.grid.advancePoint(p.divisions / 2 + 0.5 | 0, p.divisions / 2 + 0.5 | 0, gb.xw, gb.xh);
		var b = {
			x: point.x - gb.xw / 2,
			y: point.y - gb.xh / 2,
			w: gb.xw,
			h: gb.xh
		};
		var i = p.loadingIconImage;
		p._ctx.drawImage(i, 0, 0, i.width, i.height, b.x, b.y, b.w, b.h);
		console.log('drawing icon at ' + JSON.stringify(b));
	},
	_createUpdateFn: function(p, o) {
		var $self = this;
		var fn = snippet_evt_on(p.canvas, 'viewer_update', function() {
			//console.info('viewer.update ' + p.index);

			if (p.imagesInMemory !== null) {
				var curr = $self._getCurrentImage(p);
				var i = curr.img;
				if (!p.isFullscreen) {
					$self._rescaleCanvasProportionally(i, p);
				}
				if (typeof p.imagesInMemoryData[curr.index] == 'undefined') {
					p.imagesInMemoryData[curr.index] = $self._createImageViewerData(p, i);
				}
				var sd = $self._getImageViewerZoomData(p.imagesInMemoryData[curr.index], p.imagesInMemoryData[curr.index].index);


				//$self._drawLoadingIcon(p);
				var ms1 = new Date().getTime();

				p._ctx.drawImage(i, sd.rx, sd.ry, sd.sw, sd.sh, 0, 0, p.canvas.width, p.canvas.height);
				var ms2 = new Date().getTime();
				var diff = snippet_date_milli_diference(ms1, ms2);
				//console.log('loading time ' + JSON.stringify(diff));
				if (o.isNegative) {
					(function(imageObj, context, canvas) {
						var imageData = context.getImageData(0, 0, p.canvas.width, p.canvas.height);
						var pixels = imageData.data;
						for (var i = 0; i < pixels.length; i += 4) {
							pixels[i] = 255 - pixels[i]; // red
							pixels[i + 1] = 255 - pixels[i + 1]; // green
							pixels[i + 2] = 255 - pixels[i + 2]; // blue
							// i+3 is alpha (the fourth element)
						}
						context.putImageData(imageData, 0, 0);
					})(i, p._ctx);
				}

			}
			$self.grid.draw(p)

			if (typeof p._selector !== 'undefined') {
				p._selector.draw();
			}

			p._nextZoomData = $self._calculateNextZoomData(p);

			var evt = new Event('viewer_update_end');
			evt.p = p;
			p.canvas.dispatchEvent(evt);

		});
		return fn;
	},
	_calculateNextZoomData: function(p) {
		var $self = this;
		//console.log('calculating for ' + p._selectorX + ', ' + p._selectorY);
		var curr = $self._getCurrentImage(p);
		var currData = p.imagesInMemoryData[curr.index];
		var zd = $self._getImageViewerZoomData(currData, currData.index);
		var ozd = $self._getImageViewerZoomData(currData, 0);
		//console.log(currData.zoomData);
		//console.log(zd);
		//var point = $self.grid.advancePoint(p._selectorX, p._selectorY, ozd.xw, ozd.xh);;
		var topleft = {
			x: (zd.xw * (p._selectorX - 1)) + zd.sx,
			y: (zd.xh * (p._selectorY - 1)) + zd.sy,
		};
		//console.info(topleft);
		//vw -> vtlx
		//w  -> 
		topleft.rx = (curr.img.width * topleft.x) / p.canvas.width;
		topleft.ry = (curr.img.height * topleft.y) / p.canvas.height;


		var nsBounds = {
			w: (curr.img.width * zd.xw) / p.canvas.width,

			h: (curr.img.height * zd.xh) / p.canvas.height
		}

		var d = {
				xw: zd.xw / p.divisions,
				xh: zd.xh / p.divisions,
				sx: topleft.x,
				sy: topleft.y,
				rx: topleft.rx,
				ry: topleft.ry,
				sw: nsBounds.w,
				sh: nsBounds.h
			}
			//console.log('nzd ' + JSON.stringify(d));
		return d;
	},
	_getCurrentImage: function(p) {
		var c = 0;
		for (var x in p.imagesInMemory) {
			if (c == p.index) {
				return {
					img: p.imagesInMemory[x],
					index: x
				};
			}
			c++;
		}
		return null;
	},
	_zoomIn: function(p) {
		var $self = this;
		var curr = $self._getCurrentImage(p);
		p.imagesInMemoryData[curr.index].zoomData.push(p._nextZoomData);
		p.imagesInMemoryData[curr.index].index = p.imagesInMemoryData[curr.index].zoomData.length - 1;
		p.canvas.dispatchEvent(new Event('viewer_update'));

	},
	_zoomOut: function(p) {
		var $self = this;
		var curr = $self._getCurrentImage(p);
		if (p.imagesInMemoryData[curr.index].zoomData.length > 1) {
			p.imagesInMemoryData[curr.index].zoomData.pop();
			p.imagesInMemoryData[curr.index].index -= 1;
			p.canvas.dispatchEvent(new Event('viewer_update'));
		}
	},
	_bindKeyboard: function(p, o) {
		var $self = this;
		return snippet_evt_on(window, 'keydown', function(e) {
			var k = String.fromCharCode(e.keyCode).toUpperCase();
			if (typeof p._selector !== 'undefined') {

				//console.warn(e.keyCode);
				if (e.keyCode == 37) {
					o.prev();
					return;
				}
				if (e.keyCode == 39) {
					o.next();
					return;
				}

				if (e.keyCode == 32) {
					$self._zoomIn(p);
					return;
				}
				if (e.keyCode == 79) {
					$self._zoomOut(p);
					return;
				}

				if (k == 'N') {
					o.toggleNegative(!o.isNegative);
				}

				if (k == 'A') {
					p._selector.moveH(-1);
				} else {
					if (k == 'D') {
						p._selector.moveH(1);
					}
				}
				if (k == 'W') {
					p._selector.moveY(-1);
				} else {
					if (k == 'S') {
						p._selector.moveY(1);
					}
				}
			}
		});
	},
	create: function(p) {
		var $self = this;
		$self._setDefaults(p);
		var o = {
			isFullscreen: false,
			isNegative: false
		};
		p._oriW = p.canvas['width'];
		p._oriH = p.canvas['height'];
		p._fnFullscreen = $self._createFullscreenFn(p, o);
		o.update = $self._createUpdateFn(p, o);
		p._selector = $self._createSelector(p, o);
		p._fnUnbindKeyboard = $self._bindKeyboard(p, o);
		o.toggleFullscreen = function(b) {
			o.isFullscreen = b;
			if (b) {
				p._fnFullscreen();
			} else {
				p.canvas.setAttribute('width', p._oriW);
				p.canvas.setAttribute('height', p._oriH);
				o.update();
			}
		};
		o.toggleNegative = function(b) {
			this.isNegative = b;
			p.canvas.dispatchEvent(new Event('viewer_update'));
		}
		if (p.fullscreen) {
			o.toggleFullscreen(true);
		}
		o.show = function() {
			p.canvas.style.display = 'inherit';
			o.update();
		};
		o.hide = function() {
			p.canvas.style.display = 'none';
		};
		o.next = function() {
			if (p.index + 1 <= p.imagesInMemoryLength - 1) {
				p.index += 1;
			}
			p.canvas.dispatchEvent(new Event('viewer_update'));
		};
		o.prev = function() {
			if (p.index - 1 >= 0) {
				p.index -= 1;
			}
			p.canvas.dispatchEvent(new Event('viewer_update'));
		};
		o.goto = function(v) {
			if (v - 1 >= 0) {
				if (v - 1 <= p.imagesInMemoryLength - 1) {
					p.index = v - 1;
				}
			}
			p.canvas.dispatchEvent(new Event('viewer_update'));
		};

		o.p = p;



		//check snippet
		var checks = p.images.length;
		var currCheck = 0;
		var checkInterval = setInterval(function() {
			if (currCheck == checks) {
				clearInterval(checkInterval);
				p.callback(o);
			}
		}, 500);

		//images from lib
		/*
		snippet_preloadImages([p.loadingIconUrl], function(images) {
			p.loadingIconImage = images[p.loadingIconUrl];
			currCheck++;
		});
*/


		function loadSingle(url) {
			snippet_preloadImages([url], function(images) {
				if (p.imagesInMemory == null) {
					p.imagesInMemory = images;
					p.imagesInMemoryData = {};
				} else {
					for (var xx in images) {
						p.imagesInMemory[xx] = images[xx];
					}
				}
				var c = 0;
				for (var x in p.imagesInMemory) {
					c++;
				}
				p.imagesInMemoryLength = c;
				currCheck++;
			});
		}

		//images from user
		for (var x in p.images) {
			(function() {
				var url = p.images[x];
				snippet_url_exist(url, function(exists) {
					if (exists) {
						loadSingle(url);
					} else {
						//report images not found
						currCheck++;
					}
				});
			})();
		}


	}
};

function snippet_preloadImages(a, b) {
	var o = {};
	for (var x in a) {
		(function() {
			var i = new Image(),
				y = x;
			i.onload = function() {
				o[a[y]] = i;
			};
			i.src = a[x];
		})();
	}
	var v = setInterval(function() {
		var c = 0;
		for (x in o) {
			c++;
		}
		if (c == a.length) {
			b(o);
			clearInterval(v);
		}
	}, 500);
}

function snippet_evt_off(e, evt, fn) {
	if (e.removeEventListener) {
		e.removeEventListener(evt, fn);
	} else if (e.detachEvent) {
		e.detachEvent('on' + evt, fn);
	}
}

function snippet_evt_on(elem, event, fn) {
	function listenHandler(e) {
		var ret = fn.apply(this, arguments);
		if (ret === false) {
			e.stopPropagation();
			e.preventDefault();
		}
		return (ret);
	}

	function attachHandler() {
		var ret = fn.call(elem, window.event);
		if (ret === false) {
			window.event.returnValue = false;
			window.event.cancelBubble = true;
		}
		return (ret);
	}
	if (elem.addEventListener) {
		elem.addEventListener(event, listenHandler, false);
		return listenHandler;
	} else {
		elem.attachEvent("on" + event, attachHandler);
		return attachHandler;
	}
}

function snippet_scale_restrictW(w, h, r) {
	var rta = {
		w: w,
		h: h
	}
	if (w > r) {
		rta.w = r;
		rta.h = (rta.w * h) / w;
	}
	return rta;
}

function snippet_scale_restrictH(w, h, r) {
	var rta = {
		w: w,
		h: h
	};
	if (h > r) {
		rta.h = r;
		rta.w = (rta.h * w) / h;
	}
	return rta;
}

function snippet_scale_restrictAuto(w, h, rw, rh) {
	var r = null;
	if (w >= h) {
		if (w > rw) {
			r = snippet_scale_restrictW(w, h, rw);
			return snippet_scale_restrictH(r.w, r.h, rh);
		}
	} else {
		if (h > rh) {
			r = snippet_scale_restrictH(w, h, rh);
			return snippet_scale_restrictW(r.w, r.h, rw);
		}
	}
}

function snippet_date_diference(d1, d2) {
	var m1 = d1.getTime();
	var m2 = d2.getTime();
	return snippet_date_milli_diference(m1, m2);
}

function snippet_date_milli_diference(m1, m2) {
	var ms = Math.abs(m2 - m1);
	days = Math.floor(ms / (24 * 60 * 60 * 1000));
	daysms = ms % (24 * 60 * 60 * 1000);
	hours = Math.floor((daysms) / (60 * 60 * 1000));
	hoursms = ms % (60 * 60 * 1000);
	minutes = Math.floor((hoursms) / (60 * 1000));
	minutesms = ms % (60 * 1000);
	sec = Math.floor((minutesms) / (1000));
	return {
		d: days,
		h: hours,
		m: minutes,
		s: sec
	};
}

function snippet_url_exist(url, fn) {
	var reader = new XMLHttpRequest();
	var checkFor = url;
	reader.open('get', checkFor, true);
	reader.onreadystatechange = checkReadyState;

	function checkReadyState() {
		if (reader.readyState === 4) {
			if ((reader.status == 200) || (reader.status == 0)) {
				fn(true);
			} else {
				fn(false);
				return;
			}
		}
	}
	reader.send(null);
}