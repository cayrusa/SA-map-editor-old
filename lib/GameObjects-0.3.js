"use strict";
(function () {
	/*
	* Main Class of mapbjects.
	* Obj = loaded metadata, Img = loaded imagefile.
	*/
	function MapObject (obj, img){
		this.Container_constructor();
		
		this.name = obj.id || null;
		this.mouseChildren = false;
		this.cursor = "pointer";
		this.on("mousedown", this.handleMouseDown);
		this.parentPanel = obj.parentPanel;

		if (img) {
			this.gfx = new createjs.Bitmap(img);
			this.bounds = this.gfx.getBounds();
		
			this.gfx.regX = this.bounds.width/2;
			this.gfx.regY = this.bounds.height/2;
		} else {
			this.gfx = obj.gfx.clone();
			this.bounds = this.gfx.getBounds();
		};
		this.addChild(this.gfx);
	};
	createjs.extend(MapObject, createjs.Container);

	// Specific types of map objects
	
	
	function DistantSun (obj, img){
		this.MapObject_constructor(obj, img);
		var panelscale = 3;
		var mapscale = 7.5;
		this.scaleX = this.scaleY = panelscale;
		this.gfx.scaleX = this.gfx.scaleY = tileWidth/ (mapscale*this.bounds.width);
	};
	createjs.extend(DistantSun, MapObject);

	function Unit (obj, img){
		this.MapObject_constructor(obj, img);
		var panelscale = obj.panelScale;
		var mapscale = obj.mapScale;
		this.scaleX = this.scaleY = panelscale;
		this.gfx.scaleX = this.gfx.scaleY = tileWidth/ (mapscale*this.bounds.width);
	};
	createjs.extend(Unit, MapObject);

	function Counter (obj, img){
		this.MapObject_constructor(obj, img);
		var panelscale = obj.panelScale;
		var mapscale = obj.mapScale;
		this.scaleX = this.scaleY = panelscale;
		this.gfx.scaleX = this.gfx.scaleY = tileWidth/ (mapscale*this.bounds.width);
	};
	createjs.extend(Counter, MapObject);

	function Wormhole (obj, img){
		this.MapObject_constructor(obj, img);
		var panelscale = 2.5;
		var mapscale = 6;
		this.scaleX = this.scaleY = panelscale;
		this.gfx.scaleX = this.gfx.scaleY = tileWidth/ (mapscale*this.bounds.width);
	};
	createjs.extend(Wormhole, MapObject);

	function Artifact (obj, img){
		this.MapObject_constructor(obj, img);
		var panelscale = 3;
		var mapscale = 5;
		this.scaleX = this.scaleY = panelscale;
		this.gfx.scaleX = this.gfx.scaleY = tileWidth/ (mapscale*this.bounds.width);
	};
	createjs.extend(Artifact, MapObject);

	function AsteroidBelt (obj, img){
		this.MapObject_constructor(obj, img);
		this.scaleX = this.scaleY = 2;
		this.rotation = 45;
		this.gfx.scaleX = this.gfx.scaleY = tileWidth/ (2*this.bounds.width);// };
	};
	createjs.extend(AsteroidBelt, MapObject);

	function Tile (obj, img){
		this.MapObject_constructor(obj, img);

		this.planets = obj.planets || null;
		this.unique = (obj.planets!=null) ? true:false;
		this.q = obj.q;
		this.r = obj.r;
		this.clonedFrom = obj.clonedFrom || this;

		/*
		var hexagon = new createjs.Shape();
		hexagon.graphics.drawPolyStar(0, 0, this.bounds.width/2, 6, 0, 0);
		this.gfx.mask = hexagon;
		*/
	};	
	createjs.extend(Tile, MapObject);

	// GENERIC FUNCTIONS FOR ALL MAP objects
	MapObject.prototype.clone = function (recursive) {
		var o = this._cloneProps(new this.constructor(this));
		if (recursive) { this._cloneChildren(o); };
		return o;
	};
	
	MapObject.prototype.deleteClick = function (event){
		if (this.parent===cMap){
			cMap.removeChild(this);
		};
	};

	MapObject.prototype.handleMouseDown = function (event){
		event.stopImmediatePropagation();
		var tmp = this.clone(true);
		tmp.alpha = 0.5;
		tmp.rotation = 0;
		this.parent.localToGlobal(this.x, this.y, tmp);
		//tmp.parentPanel = cPanel.activePanel;
		tmp.scaleX = tmp.scaleY = this.parent.scaleX;
		stage.addChild(tmp);
		tmp.offset = {x:tmp.x - event.stageX, y:tmp.y - event.stageY};
		this.on("pressmove", this.handleMouseMove, tmp);
		this.on("pressup", this.handleMouseUp, tmp, true);
		if (this.parent===cMap){
			cMap.removeChild(this);
			if (this instanceof Tile) {
				delete cMap.mapTiles[this.q+"."+this.r];
				tmp.oldX = this.x;
				tmp.oldY = this.y;
				tmp.oldQ = this.q;
				tmp.oldR = this.r;
			};
		};	
	};

	MapObject.prototype.handleMouseMove = function (event){
		this.x = event.stageX;// + this.offset.x;
		this.y = event.stageY;// + this.offset.y;
		var panelCoords = cPanel.globalToLocal(event.stageX, event.stageY);
		if (!cPanel.hitTest(panelCoords.x, panelCoords.y)) {
			this.scaleX = this.scaleY = cMap.scaleX;
		} else {
			this.scaleX = this.scaleY = cPanel.activePanel.scaleX;
		};
	};

	MapObject.prototype.handleMouseUp = function (event){
		var mapCoords = cMap.globalToLocal(event.stageX, event.stageY);
		if (cMap.hitTest(mapCoords.x, mapCoords.y) || this instanceof Counter || this instanceof Unit) {
			this.alpha = 1;
			this.scaleX=this.scaleY=1;

			cMap.globalToLocal(this.x, this.y, this);

			var tmp = this.clone(true);
			cMap.addChild(tmp);
			tmp.removeAllEventListeners();

			tmp.cursor = "default";
		};
		stage.removeChild(this);
		this.removeAllEventListeners();
	};

	// SPECIFIC FUNCTIONS FOR ASTEROIDBELTS

	AsteroidBelt.prototype.handleMouseMove = function (event){
		var mapCoords = cMap.globalToLocal(event.stageX, event.stageY);
		if (cMap.hitTest(mapCoords.x, mapCoords.y)) {
			var tmpQR = cMap.grid.pixelToIntegerQR(mapCoords.x, mapCoords.y);
			var center = cMap.grid.getCenterXY(tmpQR.q, tmpQR.r);
			var triangle = cMap.grid.triangle(center, mapCoords);
			var p1 = cMap.grid.hexCorner(center, triangle);
			var p2 = cMap.grid.hexCorner(center, triangle-1);
			// Normalize to values [-1,0,1]
			var angle = (triangle<=0) ? 5-triangle:2-triangle;
			this.rotation = angle*60;

			cMap.localToGlobal((p2.x+p1.x)/2, (p2.y+p1.y)/2, this);
			this.scaleX = this.scaleY = cMap.scaleX;
		} else {
			this.x = event.stageX;
			this.y = event.stageY;
			var panelCoords = cPanel.globalToLocal(event.stageX, event.stageY);
			if (cPanel.hitTest(panelCoords.x, panelCoords.y)) {
				this.scaleX = this.scaleY = cPanel.activePanel.scaleX;
			} else {
				this.scaleX = this.scaleY = cMap.scaleX;
			};
		};
	};

	// SPECIFIC FUNCTIONS FOR TILES
	Tile.prototype.deleteClick = function (event, data){
		if (this.parent===cMap){
			delete cMap.mapTiles[this.q+"."+this.r];
			if (this.unique){
				cPanel.addTile(this.clonedFrom, this.parentPanel);
				if (cPanel.activePanel===this.parentPanel&&data){
					cPanel.populate(this.parentPanel, data.update);
				};
			};
			cMap.removeChild(this);			
		};
	};

	Tile.prototype.handleMouseMove = function (event){ //, data){
		var panelCoords = cPanel.globalToLocal(event.stageX, event.stageY);
		if (cPanel.hitTest(panelCoords.x, panelCoords.y)) {
			this.x = event.stageX + this.offset.x;
			this.y = event.stageY + this.offset.y;
			this.scaleX = this.scaleY = cPanel.activePanel.scaleX;
		} else {
			var tmpXY = cMap.globalToLocal(event.stageX, event.stageY);
			var tmpQR = cMap.grid.pixelToIntegerQR(tmpXY.x, tmpXY.y);
			tmpXY = cMap.grid.getCenterXY(tmpQR.q, tmpQR.r);
			cMap.localToGlobal(tmpXY.x, tmpXY.y, this);
			this.q = tmpQR.q;
			this.r = tmpQR.r;
			this.scaleX = this.scaleY = cMap.scaleX;
		};
	};

	Tile.prototype.handleMouseUp = function (event){//, data){
		var panelCoords = cPanel.globalToLocal(event.stageX, event.stageY);
		if (!cPanel.hitTest(panelCoords.x, panelCoords.y)) {
			if (cMap.mapTiles.hasOwnProperty([this.q+"."+this.r])){
				var obj = cMap.mapTiles[this.q+"."+this.r];
				if (!this.oldX){
					// SWAP		
					if (obj.unique && this.unique) {
						cPanel.removeTile(this.clonedFrom, this.parentPanel);
						cPanel.addTile(obj.clonedFrom, obj.parentPanel);
					}
		 			// PLACE AND REMOVE FROM LIST
		 			else if (!obj.unique && this.unique) {
		 				cPanel.removeTile(this.clonedFrom, this.parentPanel);
			 		}
			 		// PLACE AND REPLACE TARGET, DO NOT REMOVE FROM LIST
			 		else if (obj.unique && !this.unique) {
		 				cPanel.addTile(obj.clonedFrom, obj.parentPanel);
		 			};
			 		cMap.removeChild(obj);
				} else {
					obj.set({x:this.oldX, y:this.oldY, q:this.oldQ, r:this.oldR});
					cMap.mapTiles[obj.q+"."+obj.r] = obj;
					this.oldX = this.oldY = this.oldQ = this.oldR = null;
				};
			} else if (this.unique) {
				cPanel.removeTile(this.clonedFrom, this.parentPanel);
			};
		
			this.alpha = 1;
			this.scaleX=this.scaleY=1;

			cMap.globalToLocal(this.x, this.y, this);

			var newTile = this.clone(true);
			cMap.mapTiles[this.q+"."+this.r] = newTile;
			cMap.addChildAt(newTile, 0);
			newTile.removeAllEventListeners();

			newTile.cursor = "default";
			cPanel.populate(cPanel.activePanel, true);
		} else if (this.clonedFrom.parent === cMap) {
			cPanel.addTile(this.clonedFrom, this.parentPanel);
			cPanel.populate(cPanel.activePanel, true);
		};
		stage.removeChild(this);
		this.removeAllEventListeners();
	};	
	window.MapObject = createjs.promote(MapObject, "Container");
	window.DistantSun = createjs.promote(DistantSun, "MapObject");
	window.Wormhole = createjs.promote(Wormhole, "MapObject");
	window.Artifact = createjs.promote(Artifact, "MapObject");
	window.AsteroidBelt = createjs.promote(AsteroidBelt, "MapObject");
	window.Tile = createjs.promote(Tile, "MapObject");
	window.Unit = createjs.promote(Unit, "MapObject");
	window.Counter = createjs.promote(Counter, "MapObject");
}());