"use strict";
(function () {
	function PanelContainer (x, y){
		this.Container_constructor();
		this.x = x;
		this.y = y;
		this.curX = x;
		this.panels = {
			Planets:  new createjs.Container(), 
			Special:  new createjs.Container(), 
			Homesystems:  new createjs.Container(), 
			Tokens:  new createjs.Container(),
			Units:  new createjs.Container(),
			Counters:  new createjs.Container()
		};

		for (var panel in this.panels) {this.panels[panel].tiles = []};
		
		this.activePanel = this.panels["Planets"];

		this.bounds = new createjs.Graphics.RoundRect(0, 0, x-y/2, element.height - 1.5*y, 15, 15, 15, 15);
		
		// Graphics commands
		this.border_length = new createjs.Graphics.LineTo(0, 0);
		this.border_height = new createjs.Graphics.LineTo(0, 0);
	};
	createjs.extend(PanelContainer, createjs.Container);

	// Shapes
	var	n_border, e_border, s_border, w_border,	nw_corner, ne_corner, se_corner, sw_corner,
		scrollSlider, scrollSliderMask,	zoomSlider,	zoomSliderMask,	panelMask;

	// ANIMATIONS
	PanelContainer.prototype.slideIn = function(){
		var slideInTween = new createjs.Tween(this).to({x:this.curX}, 750, createjs.Ease.quadOut);
	};

	PanelContainer.prototype.slideOut = function(){
		if (this.curX==this.x) { this.curX = this.x; };
		var slideOutTween = new createjs.Tween(this).to({x:element.width+10}, 750, createjs.Ease.quadIn);
	};

	function handleScrollSliderChange(event) {
		this.scroll(calcScroll(event.target.value, event.target.min, event.target.max, this.activePanel.currentHeight, 0), true);
	};

	PanelContainer.prototype.scroll = function (y, cache, bounds) {
		if ((this.activePanel.currentHeight + this.bounds.h) > this.bounds.h) {
			this.activePanel.y = y;
		} else {
			this.activePanel.y = 0;
		};
		cachePanel(this, cache, bounds);
	};

	function handleZoomSliderChange(event) {
		//event.stopImmediatePropagation();
		this.activePanel.scaleX = this.activePanel.scaleY = event.target.value;
		reCalcScroll(this, true);
	};

	function reCalcScroll(t, cache, bounds){
		t.populate(t.activePanel);
		t.scroll(calcScroll(scrollSlider.value, scrollSlider.min, scrollSlider.max, t.activePanel.currentHeight, 0), cache, bounds);
		scrollSlider.set({value: reverseCalcScroll(t.activePanel.y, scrollSlider.min, scrollSlider.max, t.activePanel.currentHeight, 0)});
	};

	PanelContainer.prototype.makePanel = function (){
		// DECLARATIONS
		zoomSlider = new Slider(0.1, (this.bounds.w-this.y/2)/(tileWidth+60), this.bounds.w/3, 15);
		zoomSliderMask = makeSliderMask(zoomSlider.width, zoomSlider.height, "red", 1);
		scrollSlider = new Slider(0, 100, this.bounds.h * 0.5, 15);
		scrollSliderMask = makeSliderMask(scrollSlider.width, scrollSlider.height, "red", 1);
		panelMask = new createjs.Shape();
		var container;

		// SETTING VALUES
		panelMask.graphics.f("grey").append(this.bounds);
		panelMask.alpha = 0.5;

		zoomSlider.set({value: zoomSlider.max/3, mask:zoomSliderMask});
		zoomSlider.x = this.y/2;

		scrollSlider.set({value: 0, regX:15, regY:15, rotation:90, mask:scrollSliderMask});
		scrollSlider.y = this.y/2;

		scrollSliderMask.set({regX:scrollSlider.height, regY:scrollSlider.height, rotation:90});
		scrollSliderMask.y = scrollSlider.y;
		zoomSliderMask.x = zoomSlider.x;

		for (var name in this.panels){
			container = this.panels[name];
			container.name = name;
			container.visible = false;
			container.currentTilesPerRow = 0;
			container.currentHeight = 0;
			container.mask = panelMask;
			container.scaleX = container.scaleY = zoomSlider.value;
			container.tiles.sort(sortTiles);
			this.addChild(container);
			this.populate(container);
		};
		this.activePanel.visible = true;
		
		makeBorder(this, 5);
		this.addChild(nw_corner, ne_corner, se_corner, sw_corner,
			n_border, s_border, w_border, e_border,
			scrollSlider, zoomSlider, zoomSliderMask, scrollSliderMask);
		this.addChildAt(panelMask, 0);
		addEventListeners(this);		
		this.x = element.width+10;
		resizeBorder(this);
	};
		
	function resizeNWC(event){
		var offset = {x:this.x - event.stageX, y:this.y - event.stageY, w:this.bounds.w + event.stageX, h:this.bounds.h + event.stageY};
		var pressmovelistener = this.on("pressmove", function (evt){
			var minHeight = scrollSlider.width+2*this.bounds.radiusTL;
			var minWidth = zoomSlider.width+2*zoomSlider.x;
			var width = offset.w - evt.stageX;
			var height = offset.h - evt.stageY;
			
			if (width>minWidth){
				this.bounds.w = width;
				this.x = evt.stageX+offset.x;
			} else {
				this.bounds.w = minWidth;
			};

			if (height>minHeight){
				this.bounds.h = height;
				this.y = evt.stageY+offset.y;
			} else {
				this.bounds.h = minHeight;
			};
			
			resizeBorder(this);	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};

	function resizeNEC(event){
		var offset = {y:this.y - event.stageY, w:this.bounds.w - event.stageX, h:this.bounds.h + event.stageY};
		var pressmovelistener = this.on("pressmove", function (evt){
			var minHeight = scrollSlider.width+2*this.bounds.radiusTL;
			var height = offset.h - evt.stageY;
			var minWidth = zoomSlider.width+2*zoomSlider.x;
			var width = evt.stageX+offset.w;
			
			this.bounds.w = (width>minWidth) ? width:minWidth;

			if (height>minHeight){
				this.bounds.h = height;
				this.y = evt.stageY+offset.y;
			} else {
				this.bounds.h = minHeight;
			};
			
			resizeBorder(this);	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};

	function resizeSWC(event){
		var offset = {x:this.x - event.stageX, w:this.bounds.w + event.stageX, h:this.bounds.h - event.stageY};
		var pressmovelistener = this.on("pressmove", function (evt){
			var minHeight = scrollSlider.width+2*this.bounds.radiusTL;
			var height = evt.stageY + offset.h;
			var minWidth = zoomSlider.width+2*zoomSlider.x;
			var width = offset.w - evt.stageX;
			
			this.bounds.h = (height>minHeight) ? height:minHeight;

			if (width>minWidth){
				this.bounds.w = width;
				this.x = evt.stageX+offset.x;
			} else {
				this.bounds.w = minWidth;
			};
			
			resizeBorder(this);	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};

	function resizeSEC(event){
		var offset = {w:this.bounds.w - event.stageX, h:this.bounds.h - event.stageY};
		var pressmovelistener = this.on("pressmove", function (evt){
			var minHeight = scrollSlider.width+2*this.bounds.radiusTL;
			var height = evt.stageY+offset.h;
			var minWidth = zoomSlider.width+2*zoomSlider.x;
			var width = evt.stageX+offset.w;
			this.bounds.h = (height>minHeight) ? height:minHeight;
			this.bounds.w = (width>minWidth) ? width:minWidth;
			
			resizeBorder(this);	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};

	function resizeLB(event){
		var offset = {x:this.x - event.stageX, w:this.bounds.w + event.stageX};
		var pressmovelistener = this.on("pressmove", function (evt){
			var minWidth = zoomSlider.width+2*zoomSlider.x;
			var width = offset.w - evt.stageX;
			if (width>minWidth){
				this.bounds.w = width;
				this.x = evt.stageX+offset.x;
			} else {
				this.bounds.w = minWidth;
			};
			
			resizeBorder(this);	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};

	function resizeRB(event){
		var offset = {w:this.bounds.w - event.stageX};
		var pressmovelistener = this.on("pressmove", function (evt){
			var minWidth = zoomSlider.width+2*zoomSlider.x;
			var width = evt.stageX+offset.w;
			this.bounds.w = (width>minWidth) ? width:minWidth;
			
			resizeBorder(this);	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};

	function resizeTB(event){
		var offset = {y:this.y - event.stageY, h:this.bounds.h + event.stageY};
		var pressmovelistener = this.on("pressmove", function (evt){
			var minHeight = scrollSlider.width+2*this.bounds.radiusTL;
			var height = offset.h - evt.stageY;
			if (height>minHeight){
				this.bounds.h = height;
				this.y = evt.stageY+offset.y;
			} else {
				this.bounds.h = minHeight;
			};
			
			resizeBorder(this);	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};

	function resizeBB(event){
		var offset = {h:this.bounds.h - event.stageY};
		var pressmovelistener = this.on("pressmove", function (evt){
			var minHeight = scrollSlider.width+2*this.bounds.radiusTL;
			var height = evt.stageY+offset.h;
			this.bounds.h = (height>minHeight) ? height:minHeight;
			
			resizeBorder(this);	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};

	function resizeBorder(t){
		var cacheBounds = {x: t.bounds.x-scrollSlider.height, y:t.bounds.y-zoomSlider.height, w:t.bounds.w+2*scrollSlider.height, h:t.bounds.h+2*zoomSlider.height};
		var zoomWmax = (t.bounds.w-t.bounds.radiusTL)/(tileWidth+60);
		var zoomHmax = (t.bounds.h-t.bounds.radiusTL)/(tileHeight+60);
		zoomSlider.y = t.bounds.h-zoomSlider.height/2;
		zoomSlider.max = (zoomHmax<zoomWmax) ? zoomHmax:zoomWmax;

		if (t.activePanel.scaleX>zoomSlider.max) { t.activePanel.scaleX=t.activePanel.scaleY=zoomSlider.max; };

		zoomSliderMask.y = zoomSlider.y;
		scrollSlider.x = t.bounds.w - scrollSlider.height/2;
		scrollSliderMask.x = scrollSlider.x;

		ne_corner.x = t.bounds.w;
		
		se_corner.x = t.bounds.w;
		se_corner.y = t.bounds.h;
	
		sw_corner.y = t.bounds.h;

		s_border.y = t.bounds.h;
		e_border.x = t.bounds.w;

		t.border_length.x = t.bounds.w-t.bounds.radiusTL;
		t.border_height.y = t.bounds.h-t.bounds.radiusTL;

		reCalcScroll(t, false, cacheBounds);
	};

	function cachePanel(t, update, b){
		/* CURRENTLY DISABLED
		if(update){
			t.updateCache();
		} else {
			//t.uncache();
			t.cache(b.x, b.y, b.w, b.h);
		};
		*/
	};

	function makeBorder(t, strokeSize){
		// CORNERS
		nw_corner = new createjs.Shape();
		nw_corner.graphics.ss(strokeSize, "butt")
			.rs(["#333", "#FFF", "#333"], [0, 0.5, 1], 
				t.bounds.radiusTL, t.bounds.radiusTL, t.bounds.radiusTL-strokeSize/2, 
				t.bounds.radiusTL, t.bounds.radiusTL, t.bounds.radiusTL+strokeSize/2)
			.mt(t.bounds.x, t.bounds.radiusTL)
			.qt(t.bounds.x, t.bounds.y, t.bounds.radiusTL, t.bounds.y);
		nw_corner.cursor = "nwse-resize";

		ne_corner = nw_corner.clone();
		ne_corner.rotation = 90;
		ne_corner.cursor = "nesw-resize";

		se_corner = nw_corner.clone();
		se_corner.rotation = 180;
		se_corner.cursor = "nwse-resize";

		sw_corner = nw_corner.clone();
		sw_corner.rotation = 270;
		sw_corner.cursor = "nesw-resize";

		// BARS
		n_border = new createjs.Shape();
		n_border.graphics.ss(strokeSize, "butt")
			.ls(["#333", "#FFF", "#333"], [0, 0.5, 1], 0, -strokeSize/2, 0, strokeSize/2)
			.mt(t.bounds.radiusTL, t.bounds.y)
			.append(t.border_length);
		n_border.cursor = "ns-resize";

		s_border = n_border.clone();
		s_border.cursor = "ns-resize";

		w_border = new createjs.Shape();
		w_border.graphics.ss(strokeSize, "butt")
			.ls(["#333", "#FFF", "#333"], [0, 0.5, 1], -strokeSize/2, 0, strokeSize/2, 0)
			.mt(t.bounds.x, t.bounds.radiusTL)
			.append(t.border_height);
		w_border.cursor = "ew-resize";

		e_border = w_border.clone();
		e_border.cursor = "ew-resize";
	};

	function swapPanels(t, to){
		t.activePanel.zoomVal = zoomSlider.value;
		t.activePanel.scrollVal = scrollSlider.value;
		t.activePanel.visible = false;
		t.swapChildren(to, t.activePanel);
		t.activePanel = to;
		t.populate(t.activePanel, true);
		t.activePanel.visible = true;
		zoomSlider.set({value:t.activePanel.zoomVal || t.activePanel.scaleX});
		scrollSlider.set({value:t.activePanel.scrollVal || 0});
		cachePanel(t, true);
	};

	PanelContainer.prototype.changePanel = function (to) {
		to = this.panels[to];
		swapPanels(this, to);
		this.slideIn();
	};

	// "Duck typing" mousewheel function. This container will scale on mousewheel events
	PanelContainer.prototype.mouseWheel = function (event) {
		var delta = -event.detail*120 || event.wheelDelta; 
		var step = 100;
		var val;

		if (delta > 100) { delta = 100; }
		if (delta < -100) { delta = -100; }

		val = scrollSlider.value - delta/step;

		if (val < scrollSlider.min) {val = scrollSlider.min;}
		if (val > scrollSlider.max) {val = scrollSlider.max;}

		scrollSlider.set({value: val});
		this.scroll(calcScroll(val, scrollSlider.min, scrollSlider.max, this.activePanel.currentHeight, 0), true);
	};

	function mouseDown(event){
		var offset = {x:this.x - event.stageX, y:this.y - event.stageY};
		var pressmovelistener = this.on("pressmove", function (evt){
			this.x = evt.stageX+offset.x;
			this.y = evt.stageY+offset.y;	
		}, this);
		var pressuplistener = this.on("pressup", function (){
			this.off("pressmove", pressmovelistener);
			this.off("pressup", pressuplistener);
		}, this);
	};	

	PanelContainer.prototype.addTile = function (tile, panel){
		panel.tiles.push(tile);
		tile.cursor = "pointer";
		tile.on("mousedown", tile.handleMouseDown);
		panel.tiles.sort(sortTiles);
	};

	PanelContainer.prototype.removeTile = function (tile, panel){
		var index = panel.tiles.indexOf(tile);
		if (index>=0) { 
			panel.tiles.splice(index, 1); 
		};
	};

	PanelContainer.prototype.populate = function (container, forceDraw) {
		var offset  = 20;
		var tilesPerRow = Math.floor((this.bounds.w)/((tileWidth+3*offset)*container.scaleX));
		if (container.currentTilesPerRow!=tilesPerRow||forceDraw){
			container.removeAllChildren();
			var row = 0;
			var col = 0;
			var tile;
			var rect;
			
			for (var num = 0; num < container.tiles.length; num++) {
				tile = container.tiles[num];
				rect = new createjs.Shape();
				rect.graphics.beginStroke("lightgray").setStrokeStyle(5)
				.drawRoundRect(offset + col*(tileWidth+3*offset), offset + row*(tileHeight+3*offset), tileWidth+2*offset, tileHeight+2*offset, offset);

				tile.x = 2*offset + col*(tileWidth+3*offset) +tileWidth/2;
				tile.y = 2*offset + row*(tileHeight+3*offset) +tileHeight/2;
				tile.parentPanel = container;

				container.addChild(rect, tile);

				if (col == (tilesPerRow-1)&&row!=(container.tiles.length-1)) {
					col = 0;
					row++;
				} else {
					col++;
				};
			};
		};
		container.currentTilesPerRow = tilesPerRow;
		container.currentHeight = (2*offset+(tileHeight+3*offset)*(Math.ceil((container.tiles.length)/tilesPerRow)))*container.scaleX - this.bounds.h;
	};

	function sortTiles (a, b){
		if (a.name > b.name) {return 1;}
		if (a.name < b.name) {return -1;}
		return 0;
	};

	function calcScroll(val, scrollMin, scrollMax, scrollHeight, offset){
		return (val - scrollMin)/(scrollMax - scrollMin) * (-scrollHeight - offset) + offset;
	};

	function reverseCalcScroll(val, scrollMin, scrollMax, scrollHeight, offset){
		return (scrollMax - scrollMin)*(val - offset)/(-scrollHeight - offset) + scrollMin;
	};

	function addEventListeners (t){
		// ON ALLOWS TO SET THE SCOPE WITHOUT HAVING TO BIND THE LISTENER
		//this.mouseDownEventHandler = this.mouseDown.bind(this);
		nw_corner.on("mousedown", resizeNWC, t);
		sw_corner.on("mousedown", resizeSWC, t);
		ne_corner.on("mousedown", resizeNEC, t);
		se_corner.on("mousedown", resizeSEC, t);
		e_border.on("mousedown", resizeRB, t);
		s_border.on("mousedown", resizeBB, t);
		w_border.on("mousedown", resizeLB, t);
		n_border.on("mousedown", resizeTB, t);
		zoomSlider.on("change", handleZoomSliderChange, t);
		scrollSlider.on("change", handleScrollSliderChange, t);
 		panelMask.on("mousedown", mouseDown, t);
	};

	function makeSliderMask(width, height, color, style){
		var pt_a, pt_b, pt_c, pt_d, pt_e, pt_f;
		pt_a = {x: 0,				y: height/2};
		pt_b = {x: height, 			y: 0};
		pt_c = {x: width - height, 	y: 0};
		pt_d = {x: width, 			y: height/2};
		pt_e = {x: width - height, 	y: height};
		pt_f = {x: height, 			y: height};
		/* 
		* s = beginStroke
		* ss = strokeStyle
		* lt = lineTo
		*/
		var sliderMask = new createjs.Shape();
		sliderMask.graphics.s(color).ss(style).lt(pt_a.x, pt_a.y).lt(pt_b.x, pt_b.y)
			.lt(pt_c.x, pt_c.y).lt(pt_d.x, pt_d.y).lt(pt_e.x, pt_e.y).lt(pt_f.x, pt_f.y).lt(pt_a.x, pt_a.y);

		return sliderMask;
	};

	window.PanelContainer = createjs.promote(PanelContainer, "Container");
}());