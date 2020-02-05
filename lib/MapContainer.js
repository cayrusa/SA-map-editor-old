"use strict";
(function () {
	function MapContainer (x, y, maxZoom){
		this.Container_constructor();
		this.x = x;
		this.y = y;

		this.maxZoom = maxZoom || 10;

		this.minScaleX;
		this.maxScaleX;
		this.maxScaleY;
		
		this.scaleX = this.minScaleX;
		this.scaleY = this.minScaleY;

		this.grid;

		this.mapTiles = [];

		this.addEventListeners();		
	};

	createjs.extend(MapContainer, createjs.Container);

	MapContainer.prototype.addEventListeners = function (){
  		this.on("mousedown", this.mouseDown, this);
	};	
	
	MapContainer.prototype.loadJSON = function(){
		if (window.File && window.FileReader && window.Blob){
			var input = document.createElement('input');
			var t = this;
			input.display = "none";
			input.type = "file";
			input.accept = ".t3m";
			input.addEventListener("change", function(event){handleJSONLoad(event, input, t);}, false);
			input.click();
		} else {
			alert("Your browser does not support the necessary File API");
		};
	};

	function handleJSONLoad(event, input, t){
		var reader = new FileReader();
		var map;
		reader.onerror = loadErrorHandler;
		reader.onload = function(e){
			map = JSON.parse(reader.result).map;
			resetMap(map, t, loadMap);
		};
		reader.readAsText(event.target.files[0]);
	};

	function loadErrorHandler(event){
		switch(event.target.error.code){
			case event.target.error.NOT_FOUND_ERR: {
				alert("File not found!");
				break;
			};
			case event.target.error.NOT_READABLE_ERR: {
				alert("File is not readable!");
				break;
			};
			case event.target.error.ABORT_ERR: {
				break;
			};
			default: {
				alert("An error occured reading this file.");
			};
		};
	};

	MapContainer.prototype.saveMapPNG = function(){
		if (window.File && window.FileReader && window.Blob){
			var bounds = this.getBounds();
			this.cache(bounds.x, bounds.y, bounds.width, bounds.height);
			this.cacheCanvas.toBlob(function(blob){savefile(blob, "map.png")});
			this.uncache();
		} else {
			alert("Your browser does not support the necessary File API");
		};
	};

	MapContainer.prototype.saveMapJSON = function (){
		if (window.File && window.FileReader && window.Blob){
			var map = [];
			var obj;
			var blob;
			for (var i = 0; i < this.children.length; i++) {
				obj = this.children[i];
				map.push({id:obj.name, x:obj.x, y:obj.y, q:obj.q, r:obj.r, panel:obj.parentPanel.name, rotation:obj.rotation});
			};
			map = JSON.stringify({map:map});
			blob = new Blob([map], {type: "application/vnd+TI3.map+json"});
			savefile(blob, "map.t3m");
		} else {
			alert("Your browser does not support the necessary File API");
		};
	};

	function savefile(blob, filename){
		var a = document.createElement('a');
		var blobUrl = URL.createObjectURL(blob);
		a.display = "none";
		a.href = blobUrl;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	MapContainer.prototype.mouseDown = function (event){
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

	MapContainer.prototype.makeMap = function (){
		this.maxScaleX = this.maxScaleY = element.height/tileHeight;
		this.minScaleX = this.minScaleY = element.height/(tileHeight*this.maxZoom);
		this.scaleX = this.scaleY = this.minScaleX;
		this.grid = new Grid(tileWidth/2, 0, false, true);
		loadMap(null, this);
	};

	function loadMap(map, t){
		var tmp;
		for (var panel in cPanel.panels) {
			if (cPanel.panels[panel] === cPanel.activePanel){
				cPanel.populate(cPanel.panels[panel], true);
			} else {
				cPanel.populate(cPanel.panels[panel], false);
			};
		};
		map = map || [{id:"Tile-Mecatol_Rex", x:0, y:0, q:0, r:0, panel:"Planets"}];
		for (var i = 0; i < map.length; i++) {
			tmp = cPanel.panels[map[i].panel].getChildByName(map[i].id).clone(true);
			tmp.parentPanel = cPanel.panels[map[i].panel];
			if (tmp.unique) {
				cPanel.removeTile(tmp.clonedFrom, tmp.parentPanel);
			};
			tmp.x = map[i].x;
			tmp.y = map[i].y;
			tmp.removeAllEventListeners();
			var mapObj = tmp.clone(true);
			mapObj.removeAllEventListeners();
			mapObj.q = map[i].q;
			mapObj.r = map[i].r;
			mapObj.scaleX = mapObj.scaleY = 1;
			mapObj.rotation = map[i].rotation || 0;
			t.mapTiles[mapObj.q+"."+mapObj.r] = mapObj;
			t.addChild(mapObj);
			mapObj.cursor = "default";
		};
		cPanel.populate(cPanel.activePanel, true);
	};

	function resetMap(map, t, callback){
		var numChildren = t.children.length;
		for (var i = 0; i < numChildren; i++) {
			t.children[0].deleteClick();
		};
		cPanel.populate(cPanel.activePanel, true);
		if (typeof callback === "function"){
			callback(map, t);
		};
	};

	MapContainer.prototype.newMap = function (){
		resetMap(null, this, loadMap);
	};

	MapContainer.prototype.zoomMap = function (event){
		var obj;
		var coords = {x:event.stageX, y:event.stageY};
		this.globalToLocal(coords.x, coords.y, coords);
		if (this.hitTest(coords.x, coords.y)){
			obj = this.getObjectUnderPoint(coords.x, coords.y, 1);
		} else {
			obj = this;
		};
		var bounds = obj.getBounds();
		var calcXscale = element.height/bounds.height;
		var calcYscale = element.width/bounds.width;
		cMap.scaleX = cMap.scaleY = (calcXscale<calcYscale)	? calcXscale:calcYscale;
		var coords = obj.localToGlobal(bounds.x, bounds.y);
		cMap.x -= coords.x;
		cMap.y -= coords.y;
	};

	// "Duck typing" mousewheel function. This container will scale on mousewheel events
	MapContainer.prototype.mouseWheel = function (event, mousecoords) {
		var delta = -event.detail*120 || event.wheelDelta;
		var holder = this;
		var previousRegX = holder.regX;
		var previousRegY = holder.regY;
		holder.regX = mousecoords.x;
		holder.regY = mousecoords.y;

		if (delta > 100) { delta = 100; }
		if (delta < -100) { delta = -100; }

		holder.scaleX = holder.scaleX + delta / 2500;
		holder.scaleY = holder.scaleY + delta / 2500;
		if (delta > 0) {
			if (holder.scaleX > this.maxScaleX) { holder.scaleX = this.maxScaleX; }
			if (holder.scaleY > this.maxScaleY) { holder.scaleY = this.maxScaleY; }
		} else {
			if (holder.scaleX < this.minScaleX) { holder.scaleX = this.minScaleX; }
			if (holder.scaleY < this.minScaleY) { holder.scaleY = this.minScaleY; }
		}

		var matrix = new createjs.Matrix2D();
		matrix.appendTransform(holder.x, holder.y, holder.scaleX, holder.scaleY, holder.rotation, holder.skewX, holder.skewY, -(mousecoords.x - previousRegX), -(mousecoords.y - previousRegY));
		matrix.decompose(holder);
	};

	window.MapContainer = createjs.promote(MapContainer, "Container");
}());