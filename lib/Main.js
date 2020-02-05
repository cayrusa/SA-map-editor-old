"use strict";
$(document).ready(init);
var element, starfield, stage, cMap, cPanel, loaderbar, logoloader, loader, tileWidth, tileHeight;
function init(){
	element	= document.getElementById("stage");
	element.height = window.innerHeight;
	element.width = window.innerWidth;

	starfield = new createjs.Shape();
	stage = new createjs.Stage("stage");
	cMap = new MapContainer(element.width/4, element.height/2);
	cPanel = new PanelContainer(element.width/2, 60);
	logoloader = new createjs.LoadQueue(true, "./assets/");
	loader = new createjs.LoadQueue(false, "./assets/");

	starfield.cache(0, 0, element.width, element.height);
	stage.addChild(stardust(4, 0.75), starfield, stardust(2, 0.4), cMap, cPanel);
	cMap.name = "cMap";
	cMap.editing = true;
	cPanel.name = "cPanel";
	logoloader.loadManifest([{"id":"logo", "src":"ti3logo.png"}, {"id":"mecImg", "src":"mecatol.gif"}]);

	loader.loadManifest({src:"ALL_MANIFESTS.json", type:"manifest"}, false);
	logoloader.on("complete", loadedloader);
	loader.on("progress", queueProgress);
	loader.on("fileload", fileloaded);
	loader.on("complete", queueLoaded);
};

function notYet(){
	alert("Not yet implemented");
};

function handleKeyUp(event){
	cMap.cursor = "default";
	for (var child in cMap.children){
		var mapObj = cMap.children[child];
		mapObj.removeAllEventListeners();
	};
};

function handleKeyDown(event){
	if (cMap.editing){
		if (event.altKey){
			event.stopImmediatePropagation();
			cMap.cursor = "move";
			for (var child in cMap.children){
				var mapObj = cMap.children[child];
				mapObj.on("mousedown", mapObj.handleMouseDown, mapObj, true);
			};
		};
		if (event.shiftKey){
			event.stopImmediatePropagation();
			cMap.cursor = "no-drop";
			for (var child in cMap.children){
				if (cMap.children[child] instanceof MapObject){
					var mapObj = cMap.children[child];
					mapObj.on("click", mapObj.deleteClick, mapObj, true, {update:true});
				};
			};
		};
	};
};

function loadedloader(event){
	loaderbar = new Loaderbar(element.width/2, element.height/2, logoloader.getResult("mecImg"), logoloader.getResult("logo"));
	stage.addChild(loaderbar);
	loader.load();
};

function handleMouseWheel(event){
	var x = stage.mouseX;
	var y = stage.mouseY;
	var mapCoords = cMap.globalToLocal(x, y);
	var panelCoords = cPanel.globalToLocal(x, y);
	if (cPanel.hitTest(panelCoords.x, panelCoords.y))
		cPanel.mouseWheel(event);
	else
		cMap.mouseWheel(event, mapCoords);
};

function queueProgress(event){
	loaderbar.logo.mask.scaleX = event.progress;
};

function fileloaded(event){
	makeStars();
	var id;
	if (event.item.type=="image"){
		id = event.item.id;
		id = id.split("-");

		switch (id[0]) {
			case "Tile": {
				var tile = new Tile(event.item, event.result);
				if (id[1].split("_")[0]=="HS"){
					cPanel.panels["Homesystems"].tiles.push(tile);
					break;
				} else if (tile.planets==null){
					cPanel.panels["Special"].tiles.push(tile);
					break;
				} else {
					if (tile.name == "Tile-Mecatol_Rex"){
						tileWidth = tile.bounds.width;
						tileHeight = tile.bounds.height;
					};
					cPanel.panels["Planets"].tiles.push(tile);
					break;
				};
			};
			case "Token": {
				switch (id[1]){
					case "AsteroidBelt":
          case "AsteSpaceTimeAnomaly":
          case "AsteIonSphere":
          case "AsteStandingGravWave":
          case "AsteStandingGravWave_rotated180":
						var asteroidbelt = new AsteroidBelt(event.item, event.result);
						cPanel.panels["Tokens"].tiles.push(asteroidbelt);
						break;
					;
					case "Artifact":{
						var token = new Artifact(event.item, event.result);
						cPanel.panels["Tokens"].tiles.push(token);
						break;
					};
					case "DistantSuns":{
						var ds = new DistantSun(event.item, event.result);
						cPanel.panels["Tokens"].tiles.push(ds);
						break;
					};
					case "SpaceDomain":{
						var ds = new DistantSun(event.item, event.result);
						cPanel.panels["Tokens"].tiles.push(ds);
						break;
					};
					case "Wormhole":{
						var wh = new Wormhole(event.item, event.result);
						cPanel.panels["Tokens"].tiles.push(wh);
						break;
					};
				};
				break;
			};
		};
	};
};

function queueLoaded(){
	loaderbar.glowAndFade();
};

function tick(event) {
	stage.update();
};

function loadertick(event){
	if (loaderbar){
		if (loaderbar.alpha == 0){
			createjs.Ticker.framerate = 25;
			createjs.Ticker.addEventListener("tick", tick);
			createjs.Ticker.removeEventListener("tick", loadertick);
			stage.enableMouseOver(createjs.Ticker.framerate);
			stage.removeChild(loaderbar);
			cPanel.makePanel();
			cMap.makeMap();
			cPanel.slideIn();
			element.addEventListener("mousewheel", handleMouseWheel);
			element.addEventListener("DOMMouseScroll", handleMouseWheel);
			document.addEventListener("keydown", handleKeyDown);
			document.addEventListener("keyup", handleKeyUp);
			stage.on("dblclick", cMap.zoomMap, cMap);
			$("#tiles ul li a").on("click", function(){	cPanel.changePanel($(this).text());	});
			$("#map a").on("click", function(){ cPanel.slideOut(); });
			$("#png a").on("click", function(){ cMap.saveMapPNG(); });
			$("#json a").on("click", function(){ cMap.saveMapJSON(); });
			$("#tts a").on("click", function(){ notYet(); });
			$("#load a").on("click", function(){ cMap.loadJSON(); });
			$("#new a").on("click", function(){ cMap.newMap(); });
		};
		stage.update();
	};
};

createjs.Ticker.framerate = 50;
createjs.Ticker.addEventListener("tick", loadertick);
