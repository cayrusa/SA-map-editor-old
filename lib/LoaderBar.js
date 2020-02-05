"use strict";
(function () {
	function Loaderbar (x, y, mecImg, logoImg){
		this.Container_constructor();
		this.x = x;
		this.y = y;

		var mecatol = new createjs.Bitmap(mecImg);
		this.logo = new createjs.Bitmap(logoImg);
		
		var filterFX = [new createjs.BlurFilter(10,10,1), new createjs.ColorFilter(0,0,0,1.5,0,150,255)];
		var colorMatrix = new createjs.ColorMatrix();
		colorMatrix.adjustSaturation(-100);
		colorMatrix.adjustContrast(50);
		var filterBW = [new createjs.ColorMatrixFilter(colorMatrix)];

		mecatol.regX = mecImg.width/2;
		mecatol.regY = mecImg.height/2;
		this.logo.regX = logoImg.width/2;
		this.logo.regY = logoImg.height/2;


		//var logoBW = this.logo.clone();
		var logoBW = getFXBitmap(this.logo, filterBW, 0, 0, logoImg.width, logoImg.height, 1);
		this.logoFX = getFXBitmap(this.logo, filterFX, 0, 0, logoImg.width, logoImg.height, 0);
		//createjs.Tween.get(this.logoFX, {loop:true}).to({alpha:1}, 5000).to({alpha:0}, 1000);
		var mask = new createjs.Shape();
		mask.graphics.drawRect(-logoImg.width/2, -logoImg.height/2, logoImg.width, logoImg.height);
		this.logo.mask = mask;

		this.addChild(mecatol, logoBW, this.logo, this.logoFX);
	};

	createjs.extend(Loaderbar, createjs.Container);

	function getFXBitmap(source, filters, x, y, w, h, alpha) {
		// cache the source, so we can grab a rasterized image of it:
		source.cache(x, y, w, h);
		
		// create a new Bitmap, using the source's cacheCanvas:
		var bmp = new createjs.Bitmap(source.cacheCanvas);
		
		// add the filters, and cache to apply them
		bmp.filters = filters;
		bmp.cache(0, 0, w, h);
		
		// offset the bmp's registration to account for the cache offset:
		bmp.regX = source.regX;
		bmp.regY = source.regY;
		//bmp.x = source.x;
		//bmp.y = source.y;
		bmp.alpha = alpha; //|| 1;
		
		// uncache the source:
		source.uncache();
		
		return bmp;
	};

	Loaderbar.prototype.glowAndFade = function(){
		var fade = new createjs.Tween(this, {paused:true}).to({alpha:0}, 500);
		//fade.to({alpha:0}, 500);
		var glow = new createjs.Tween(this.logoFX).wait(100).to({alpha:1}, 500).wait(100).to({alpha:0.75}, 500).play(fade);
		//glow.wait(100).to({alpha:1}, 500).wait(100).to({alpha:0.75}, 500).play(fade);
		//glow.play(glow);
	};

	

	window.Loaderbar = createjs.promote(Loaderbar, "Container");
}());

/*
		bmp = bmp.clone();
		bmp.x += 230;
		filters = [new createjs.BlurFilter(16,16,1), new createjs.ColorFilter(0,0,0,1.5,0,150,255)];
		fx = getFXBitmap(bmp, filters, 0, 0, 165, 292);
		createjs.Tween.get(fx, {loop:true}).to({alpha:1}, 5000).to({alpha:0}, 1000);
		stage.addChild(fx, bmp);

		var colorMatrix = new createjs.ColorMatrix();
		colorMatrix.adjustSaturation(-100);
		colorMatrix.adjustContrast(50);
		var blackAndWhiteFilter = new createjs.ColorMatrixFilter(colorMatrix);
		bmp = bmp.clone();
		// filters are only displayed when the display object is cached
		// later, you can call updateCache() to update changes to your filters
		bmp.filters = [blackAndWhiteFilter];
		bmp.cache(0, 0, img.width, img.height);
		bmp.x = 480;
		stage.addChild(bmp);

			function getFXBitmap(source, filters, x, y, w, h) {
		// cache the source, so we can grab a rasterized image of it:
		source.cache(x, y, w, h);
		
		// create a new Bitmap, using the source's cacheCanvas:
		var bmp = new createjs.Bitmap(source.cacheCanvas);
		
		// add the filters, and cache to apply them
		bmp.filters = filters;
		bmp.cache(0, 0, w, h);
		
		// offset the bmp's registration to account for the cache offset:
		bmp.regX = -x;
		bmp.regY = -y;
		bmp.x = source.x;
		bmp.y = source.y;
		bmp.alpha = 0;
		
		// uncache the source:
		source.uncache();
		
		return bmp;
	}
*/