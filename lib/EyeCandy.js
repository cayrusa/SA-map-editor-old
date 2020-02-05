"use strict";
function stardust(colour, alpha) {
	var scale = 64;
	var numOctaves = 3;
	var _bmd01 = new createjs.BitmapData(null, element.width/scale, element.height/scale);
	var baseX = _bmd01.width/numOctaves;
	var baseY = _bmd01.height/numOctaves;
	var randomSeed = Math.random();
	//var stitch = false;
	//var fractalNoise = false;
	var channel = Object.create(createjs.BitmapDataChannel);
	var channelOptions = colour | channel.ALPHA;
	//var grayScale = false;
	//var offsets = [new createjs.Point(0, 0), new createjs.Point(0, 0), new createjs.Point(0, 0)];
	var interpolateType = "cos";
	_bmd01.perlinNoise(baseX, baseY, numOctaves, randomSeed, false, false, channelOptions, false, null, interpolateType);
	var _bitmap01 = new createjs.Bitmap(_bmd01.canvas);
	_bitmap01.scaleX = _bitmap01.scaleY = scale;
	_bitmap01.alpha = alpha;
	//stage.addChild(_bitmap01);
	return _bitmap01;
};

function makeStars(){
	for (var i = 0; i <= 25; i++) {
		starfield.graphics.beginFill(createjs.Graphics.getRGB(0xFFFFFF, Math.random())).drawPolyStar(Math.random() * element.width, Math.random() * element.height, Math.random() * 4 + 1, 5, 0.93, Math.random() * 360);
		starfield.updateCache("source-overlay");
		starfield.graphics.clear();
	};
};