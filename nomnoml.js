var nomnoml = nomnoml || {};

(function () {
	'use strict';

	function getConfig(d) {
		return {
			arrowSize: +d.arrowSize || 1,
			bendSize: +d.bendSize || 0.3,
			direction: { down: 'TB', right: 'LR' }[d.direction] || 'TB',
			gutter: +d.gutter || 5,
			edgeMargin: (+d.edgeMargin) || 0,
			edges: { hard: 'hard', rounded: 'rounded' }[d.edges] || 'rounded',
			fill: (d.fill || '#eee8d5;#fdf6e3;#eee8d5;#fdf6e3').split(';'),
			fillArrows: d.fillArrows === 'true',
			font: d.font || 'Calibri',
			fontSize: (+d.fontSize) || 12,
			leading: (+d.leading) || 1.25,
			lineWidth: (+d.lineWidth) || 3,
			padding: (+d.padding) || 8,
			spacing: (+d.spacing) || 40,
			stroke: d.stroke || '#33322E',
			title: d.title || 'nomnoml',
			zoom: +d.zoom || 1
		};
	}

	function fitCanvasSize(canvas, rect, zoom, superSampling) {
		var w = rect.width * zoom;
		var h = rect.height * zoom;
		// Try to avoid zepto dependency
		//jqCanvas.attr({ width: superSampling * w, height: superSampling * h });
		canvas.width = w * superSampling;
		canvas.height = h * superSampling;

		// Only relavent in the nomnoml application for positioning.
		// jqCanvas.css({
		// 	top: 300 * (1 - h / viewport.height()),
		// 	left: 150 + (viewport.width() - w) / 2,
		// 	width: w,
		// 	height: h
		// });
	}

	function setFont(config, isBold, isItalic, graphics) {
		var style = (isBold === 'bold' ? 'bold ' : '');
		if (isItalic) style = 'italic ' + style;
		graphics.ctx.font = style + config.fontSize + 'pt ' + config.font + ', Helvetica, sans-serif';
	}

	function parseAndRender(code, graphics, canvas, superSampling, scale) {
		var ast = nomnoml.parse(code);
		var config = getConfig(ast.directives);
		var measurer = {
			setFont: function (a, b, c) { setFont(a, b, c, graphics); },	// Making a closure here to capture `graphics`
			textWidth: function (s) { return graphics.ctx.measureText(s).width },
			textHeight: function (s) { return config.leading * config.fontSize }
		};
		var layout = nomnoml.layout(measurer, config, ast);
		fitCanvasSize(canvas, layout, config.zoom * scale, superSampling);
		config.zoom *= superSampling;
		config.zoom *= scale;
		nomnoml.render(graphics, config, layout, measurer.setFont);
		return { config: config, superSampling: superSampling };
	}

	nomnoml.draw = function (canvas, nomnomlcode, scale) {
		var skanaarCanvas = skanaar.Canvas(canvas, {});
		return parseAndRender(nomnomlcode, skanaarCanvas, canvas, window.devicePixelRatio || 1, scale || 1);
	};
})();