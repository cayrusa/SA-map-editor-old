"use strict";

function Grid(a, b, c, d) {
    this.tileSize = a || 100, this.tileSpacing = b || 0, this.pointyTiles = c || !1, this.withOrigin = d || !0
}

function stardust(a, b) {
    var c = 64, d = 3, e = new createjs.BitmapData(null, element.width / c, element.height / c), f = e.width / d,
        g = e.height / d, h = Math.random(), i = Object.create(createjs.BitmapDataChannel), j = a | i.ALPHA, k = "cos";
    e.perlinNoise(f, g, d, h, !1, !1, j, !1, null, k);
    var l = new createjs.Bitmap(e.canvas);
    return l.scaleX = l.scaleY = c, l.alpha = b, l
}

function makeStars() {
    for (var a = 0; 25 >= a; a++) starfield.graphics.beginFill(createjs.Graphics.getRGB(16777215, Math.random())).drawPolyStar(Math.random() * element.width, Math.random() * element.height, 4 * Math.random() + 1, 5, .93, 360 * Math.random()), starfield.updateCache("source-overlay"), starfield.graphics.clear()
}

function init() {
    element = document.getElementById("stage"), element.height = window.innerHeight, element.width = window.innerWidth, starfield = new createjs.Shape, stage = new createjs.Stage("stage"), cMap = new MapContainer(element.width / 4, element.height / 2), cPanel = new PanelContainer(element.width / 2, 60), logoloader = new createjs.LoadQueue(!0, "./assets/"), loader = new createjs.LoadQueue(!1, "./assets/"), starfield.cache(0, 0, element.width, element.height), stage.addChild(stardust(4, .75), starfield, stardust(2, .4), cMap, cPanel), cMap.name = "cMap", cMap.editing = !0, cPanel.name = "cPanel", logoloader.loadManifest([{
        id: "logo",
        src: "ti3logo.png"
    }, {id: "mecImg", src: "mecatol.gif"}]), loader.loadManifest({
        src: "ALL_MANIFESTS.json",
        type: "manifest"
    }, !1), logoloader.on("complete", loadedloader), loader.on("progress", queueProgress), loader.on("fileload", fileloaded), loader.on("complete", queueLoaded)
}

function notYet() {
    alert("Not yet implemented")
}

function handleKeyUp(a) {
    cMap.cursor = "default";
    for (var b in cMap.children) {
        var c = cMap.children[b];
        c.removeAllEventListeners()
    }
}

function handleKeyDown(a) {
    if (cMap.editing) {
        if (a.altKey) {
            a.stopImmediatePropagation(), cMap.cursor = "move";
            for (var b in cMap.children) {
                var c = cMap.children[b];
                c.on("mousedown", c.handleMouseDown, c, !0)
            }
        }
        if (a.shiftKey) {
            a.stopImmediatePropagation(), cMap.cursor = "no-drop";
            for (var b in cMap.children) if (cMap.children[b] instanceof MapObject) {
                var c = cMap.children[b];
                c.on("click", c.deleteClick, c, !0, {update: !0})
            }
        }
    }
}

function loadedloader(a) {
    loaderbar = new Loaderbar(element.width / 2, element.height / 2, logoloader.getResult("mecImg"), logoloader.getResult("logo")), stage.addChild(loaderbar), loader.load()
}

function handleMouseWheel(a) {
    var b = stage.mouseX, c = stage.mouseY, d = cMap.globalToLocal(b, c), e = cPanel.globalToLocal(b, c);
    cPanel.hitTest(e.x, e.y) ? cPanel.mouseWheel(a) : cMap.mouseWheel(a, d)
}

function queueProgress(a) {
    loaderbar.logo.mask.scaleX = a.progress
}

function fileloaded(a) {
    makeStars();
    var b;
    if ("image" == a.item.type) switch (b = a.item.id, b = b.split("-"), b[0]) {
        case"Tile":
            var c = new Tile(a.item, a.result);
            if ("HS" == b[1].split("_")[0]) {
                cPanel.panels.Homesystems.tiles.push(c);
                break
            }
            if (null == c.planets) {
                cPanel.panels.Special.tiles.push(c);
                break
            }
            "Tile-Mecatol_Rex" == c.name && (tileWidth = c.bounds.width, tileHeight = c.bounds.height), cPanel.panels.Planets.tiles.push(c);
            break;
        case"Token":
            switch (b[1]) {
                case"AsteroidBelt":
                    var d = new AsteroidBelt(a.item, a.result);
                    cPanel.panels.Tokens.tiles.push(d);
                    break;
                case"Artifact":
                    var e = new Artifact(a.item, a.result);
                    cPanel.panels.Tokens.tiles.push(e);
                    break;
                case"DistantSuns":
                    var f = new DistantSun(a.item, a.result);
                    cPanel.panels.Tokens.tiles.push(f);
                    break;
                case"Unit":
                    var f = new Unit(a.item, a.result);
                    cPanel.panels.Units.tiles.push(f);
                    break;
                case"SpaceDomain":
                    var f = new DistantSun(a.item, a.result);
                    cPanel.panels.Tokens.tiles.push(f);
                    break;
                case"Wormhole":
                    var g = new Wormhole(a.item, a.result);
                    cPanel.panels.Tokens.tiles.push(g)
            }
            break;
        case"Unit":
                    var unit = new Unit(a.item, a.result);
                    cPanel.panels.Units.tiles.push(unit);
                    break;


    }
}

function queueLoaded() {
    loaderbar.glowAndFade()
}

function tick(a) {
    stage.update()
}

function loadertick(a) {
    loaderbar && (0 == loaderbar.alpha && (createjs.Ticker.framerate = 25, createjs.Ticker.addEventListener("tick", tick), createjs.Ticker.removeEventListener("tick", loadertick), stage.enableMouseOver(createjs.Ticker.framerate), stage.removeChild(loaderbar), cPanel.makePanel(), cMap.makeMap(), cPanel.slideIn(), element.addEventListener("mousewheel", handleMouseWheel), element.addEventListener("DOMMouseScroll", handleMouseWheel), document.addEventListener("keydown", handleKeyDown), document.addEventListener("keyup", handleKeyUp), stage.on("dblclick", cMap.zoomMap, cMap), $("#tiles ul li a").on("click", function () {
        cPanel.changePanel($(this).text())
    }), $("#map a").on("click", function () {
        cPanel.slideOut()
    }), $("#png a").on("click", function () {
        cMap.saveMapPNG()
    }), $("#json a").on("click", function () {
        cMap.saveMapJSON()
    }), $("#tts a").on("click", function () {
        notYet()
    }), $("#load a").on("click", function () {
        cMap.loadJSON()
    }), $("#new a").on("click", function () {
        cMap.newMap()
    })), stage.update())
}

var module = module || {};
Grid.prototype.ringCoordinates = function (a, b, c) {
    var d = this.hexagonCoordinates(a, b, c, !0);
    return this.withOrigin && d.shift(0), d
}, Grid.prototype.hexagonCoordinates = function (a, b, c, d) {
    var e = [], f = [[1, 0], [0, -1], [-1, 0], [-1, 1], [0, 1], [1, 0], [1, -1]];
    this.withOrigin && e.push({q: a, r: b});
    for (var g, h, i, j, k = d ? c : 1; c >= k; k++) for (g = a, h = b, j = 0; j < f.length; j++) for (i = 0; k > i; i++) g += f[j][0], h += f[j][1], 0 != j && e.push({
        q: g,
        r: h
    });
    return e
}, Grid.prototype.getCenterXY = function (a, b) {
    var c, d;
    return this.pointyTiles ? (c = (this.tileSize + this.tileSpacing) * Math.sqrt(3) * (a + b / 2), d = -(3 * (this.tileSize + this.tileSpacing) / 2 * b)) : (c = 3 * (this.tileSize + this.tileSpacing) / 2 * a, d = -((this.tileSize + this.tileSpacing) * Math.sqrt(3) * (b + a / 2))), {
        x: c,
        y: d
    }
}, Grid.prototype.pixelToDecimalQR = function (a, b, c) {
    var d, e;
    return "number" != typeof c && (c = 1), this.tilePointy ? (d = (1 / 3 * Math.sqrt(3) * a - 1 / 3 * -b) / (this.tileSize + this.tileSpacing), e = 2 / 3 * -b / (this.tileSize + this.tileSpacing)) : (d = 2 / 3 * a / (this.tileSize + this.tileSpacing), e = (1 / 3 * Math.sqrt(3) * -b - 1 / 3 * a) / (this.tileSize + this.tileSpacing)), d /= c, e /= c, {
        q: d,
        r: e
    }
}, Grid.prototype.pixelToIntegerQR = function (a, b, c) {
    var d, e;
    return "number" != typeof c && (c = 1), this.tilePointy ? (d = (1 / 3 * Math.sqrt(3) * a - 1 / 3 * -b) / (this.tileSize + this.tileSpacing), e = 2 / 3 * -b / (this.tileSize + this.tileSpacing)) : (d = 2 / 3 * a / (this.tileSize + this.tileSpacing), e = (1 / 3 * Math.sqrt(3) * -b - 1 / 3 * a) / (this.tileSize + this.tileSpacing)), d /= c, e /= c, {
        q: Math.round(d),
        r: Math.round(e)
    }
}, Grid.prototype.neighborCoordinates = function (a, b) {
    for (var c = [], d = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]], e = 0; 6 > e; e++) {
        var f = d[e];
        c.push({q: a + f[0], r: b + f[1]})
    }
    return c
}, Grid.prototype.axialDistance = function (a, b, c, d) {
    return (Math.abs(a - c) + Math.abs(b - d) + Math.abs(a + b - c - d)) / 2
}, Grid.prototype.pixelToAxial = function (a, b) {
    var c = this.pixelToDecimalQR(a, b), d = this.axialToCube(c), e = this.roundCube(d);
    return this.cubeToAxial(e)
}, Grid.prototype.roundCube = function (a) {
    var b = Math.round(a.x), c = Math.round(a.y), d = Math.round(a.z), e = Math.abs(b - a.x), f = Math.abs(c - a.y),
        g = Math.abs(d - a.z);
    return e > f && e > g ? b = -c - d : f > g ? c = -b - d : d = -b - c, {x: b, y: c, z: d}
}, Grid.prototype.cubeToAxial = function (a) {
    return {q: a.x, r: a.y}
}, Grid.prototype.axialToCube = function (a) {
    return {x: a.q, y: a.r, z: -a.q - a.r}
}, Grid.prototype.hexCorner = function (a, b) {
    var c = 60 * -b, d = Math.PI / 180 * c;
    return {x: a.x + this.tileSize * -Math.cos(d), y: a.y + this.tileSize * -Math.sin(d)}
}, Grid.prototype.angle = function (a, b) {
    return Math.atan2(b.y - a.y, a.x - b.x)
}, Grid.prototype.triangle = function (a, b) {
    return Math.ceil(this.angle(a, b) / (Math.PI / 3))
}, module.exports = Grid, function () {
    function a(a, b) {
        this.Container_constructor(), this.name = a.id || null, this.mouseChildren = !1, this.cursor = "pointer", this.on("mousedown", this.handleMouseDown), this.parentPanel = a.parentPanel, b ? (this.gfx = new createjs.Bitmap(b), this.bounds = this.gfx.getBounds(), this.gfx.regX = this.bounds.width / 2, this.gfx.regY = this.bounds.height / 2) : (this.gfx = a.gfx.clone(), this.bounds = this.gfx.getBounds()), this.addChild(this.gfx)
    }

    function b(a, b) {
        this.MapObject_constructor(a, b), this.scaleX = this.scaleY = 3, this.gfx.scaleX = this.gfx.scaleY = tileWidth / (5 * this.bounds.width)
    }

    function c(a, b) {
        this.MapObject_constructor(a, b), this.scaleX = this.scaleY = 3, this.gfx.scaleX = this.gfx.scaleY = tileWidth / (4.45 * this.bounds.width)
    }

    function d(a, b) {
        this.MapObject_constructor(a, b), this.scaleX = this.scaleY = 3, this.gfx.scaleX = this.gfx.scaleY = tileWidth / (4.3 * this.bounds.width)
    }

    function e(a, b) {
        this.MapObject_constructor(a, b), this.scaleX = this.scaleY = 2, this.rotation = 45, this.gfx.scaleX = this.gfx.scaleY = tileWidth / (2 * this.bounds.width)
    }

    function f(a, b) {
        this.MapObject_constructor(a, b), this.planets = a.planets || null, this.unique = null != a.planets ? !0 : !1, this.q = a.q, this.r = a.r, this.clonedFrom = a.clonedFrom || this
    }

    createjs.extend(a, createjs.Container), createjs.extend(b, a), createjs.extend(c, a), createjs.extend(d, a), createjs.extend(e, a), createjs.extend(f, a), a.prototype.clone = function (a) {
        var b = this._cloneProps(new this.constructor(this));
        return a && this._cloneChildren(b), b
    }, a.prototype.deleteClick = function (a) {
        this.parent === cMap && cMap.removeChild(this)
    }, a.prototype.handleMouseDown = function (a) {
        a.stopImmediatePropagation();
        var b = this.clone(!0);
        b.alpha = .5, b.rotation = 0, this.parent.localToGlobal(this.x, this.y, b), b.scaleX = b.scaleY = this.parent.scaleX, stage.addChild(b), b.offset = {
            x: b.x - a.stageX,
            y: b.y - a.stageY
        }, this.on("pressmove", this.handleMouseMove, b), this.on("pressup", this.handleMouseUp, b, !0), this.parent === cMap && (cMap.removeChild(this), this instanceof f && (delete cMap.mapTiles[this.q + "." + this.r], b.oldX = this.x, b.oldY = this.y, b.oldQ = this.q, b.oldR = this.r))
    }, a.prototype.handleMouseMove = function (a) {
        this.x = a.stageX, this.y = a.stageY;
        var b = cPanel.globalToLocal(a.stageX, a.stageY);
        cPanel.hitTest(b.x, b.y) ? this.scaleX = this.scaleY = cPanel.activePanel.scaleX : this.scaleX = this.scaleY = cMap.scaleX
    }, a.prototype.handleMouseUp = function (a) {
        var b = cMap.globalToLocal(a.stageX, a.stageY);
        if (cMap.hitTest(b.x, b.y)) {
            this.alpha = 1, this.scaleX = this.scaleY = 1, cMap.globalToLocal(this.x, this.y, this);
            var c = this.clone(!0);
            cMap.addChild(c), c.removeAllEventListeners(), c.cursor = "default"
        }
        stage.removeChild(this), this.removeAllEventListeners()
    }, e.prototype.handleMouseMove = function (a) {
        var b = cMap.globalToLocal(a.stageX, a.stageY);
        if (cMap.hitTest(b.x, b.y)) {
            var c = cMap.grid.pixelToIntegerQR(b.x, b.y), d = cMap.grid.getCenterXY(c.q, c.r),
                e = cMap.grid.triangle(d, b), f = cMap.grid.hexCorner(d, e), g = cMap.grid.hexCorner(d, e - 1),
                h = 0 >= e ? 5 - e : 2 - e;
            this.rotation = 60 * h, cMap.localToGlobal((g.x + f.x) / 2, (g.y + f.y) / 2, this), this.scaleX = this.scaleY = cMap.scaleX
        } else {
            this.x = a.stageX, this.y = a.stageY;
            var i = cPanel.globalToLocal(a.stageX, a.stageY);
            cPanel.hitTest(i.x, i.y) ? this.scaleX = this.scaleY = cPanel.activePanel.scaleX : this.scaleX = this.scaleY = cMap.scaleX
        }
    }, f.prototype.deleteClick = function (a, b) {
        this.parent === cMap && (delete cMap.mapTiles[this.q + "." + this.r], this.unique && (cPanel.addTile(this.clonedFrom, this.parentPanel), cPanel.activePanel === this.parentPanel && b && cPanel.populate(this.parentPanel, b.update)), cMap.removeChild(this))
    }, f.prototype.handleMouseMove = function (a) {
        var b = cPanel.globalToLocal(a.stageX, a.stageY);
        if (cPanel.hitTest(b.x, b.y)) this.x = a.stageX + this.offset.x, this.y = a.stageY + this.offset.y, this.scaleX = this.scaleY = cPanel.activePanel.scaleX; else {
            var c = cMap.globalToLocal(a.stageX, a.stageY), d = cMap.grid.pixelToIntegerQR(c.x, c.y);
            c = cMap.grid.getCenterXY(d.q, d.r), cMap.localToGlobal(c.x, c.y, this), this.q = d.q, this.r = d.r, this.scaleX = this.scaleY = cMap.scaleX
        }
    }, f.prototype.handleMouseUp = function (a) {
        var b = cPanel.globalToLocal(a.stageX, a.stageY);
        if (cPanel.hitTest(b.x, b.y)) this.clonedFrom.parent === cMap && (cPanel.addTile(this.clonedFrom, this.parentPanel), cPanel.populate(cPanel.activePanel, !0)); else {
            if (cMap.mapTiles.hasOwnProperty([this.q + "." + this.r])) {
                var c = cMap.mapTiles[this.q + "." + this.r];
                this.oldX ? (c.set({
                    x: this.oldX,
                    y: this.oldY,
                    q: this.oldQ,
                    r: this.oldR
                }), cMap.mapTiles[c.q + "." + c.r] = c, this.oldX = this.oldY = this.oldQ = this.oldR = null) : (c.unique && this.unique ? (cPanel.removeTile(this.clonedFrom, this.parentPanel), cPanel.addTile(c.clonedFrom, c.parentPanel)) : !c.unique && this.unique ? cPanel.removeTile(this.clonedFrom, this.parentPanel) : c.unique && !this.unique && cPanel.addTile(c.clonedFrom, c.parentPanel), cMap.removeChild(c))
            } else this.unique && cPanel.removeTile(this.clonedFrom, this.parentPanel);
            this.alpha = 1, this.scaleX = this.scaleY = 1, cMap.globalToLocal(this.x, this.y, this);
            var d = this.clone(!0);
            cMap.mapTiles[this.q + "." + this.r] = d, cMap.addChildAt(d, 0), d.removeAllEventListeners(), d.cursor = "default", cPanel.populate(cPanel.activePanel, !0)
        }
        stage.removeChild(this), this.removeAllEventListeners()
    }, window.MapObject = createjs.promote(a, "Container"),
        window.DistantSun = createjs.promote(b, "MapObject"),
        window.Unit = createjs.promote(b, "MapObject"),
        window.Wormhole = createjs.promote(c, "MapObject"),
        window.Artifact = createjs.promote(d, "MapObject"),
        window.AsteroidBelt = createjs.promote(e, "MapObject"),
        window.Tile = createjs.promote(f, "MapObject")
}(), function () {
    function a(a, c, d, e) {
        this.Container_constructor(), this.x = a, this.y = c;
        var f = new createjs.Bitmap(d);
        this.logo = new createjs.Bitmap(e);
        var g = [new createjs.BlurFilter(10, 10, 1), new createjs.ColorFilter(0, 0, 0, 1.5, 0, 150, 255)],
            h = new createjs.ColorMatrix;
        h.adjustSaturation(-100), h.adjustContrast(50);
        var i = [new createjs.ColorMatrixFilter(h)];
        f.regX = d.width / 2, f.regY = d.height / 2, this.logo.regX = e.width / 2, this.logo.regY = e.height / 2;
        var j = b(this.logo, i, 0, 0, e.width, e.height, 1);
        this.logoFX = b(this.logo, g, 0, 0, e.width, e.height, 0);
        var k = new createjs.Shape;
        k.graphics.drawRect(-e.width / 2, -e.height / 2, e.width, e.height), this.logo.mask = k, this.addChild(f, j, this.logo, this.logoFX)
    }

    function b(a, b, c, d, e, f, g) {
        a.cache(c, d, e, f);
        var h = new createjs.Bitmap(a.cacheCanvas);
        return h.filters = b, h.cache(0, 0, e, f), h.regX = a.regX, h.regY = a.regY, h.alpha = g, a.uncache(), h
    }

    createjs.extend(a, createjs.Container), a.prototype.glowAndFade = function () {
        var a = new createjs.Tween(this, {paused: !0}).to({alpha: 0}, 500);
        new createjs.Tween(this.logoFX).wait(100).to({alpha: 1}, 500).wait(100).to({alpha: .75}, 500).play(a)
    }, window.Loaderbar = createjs.promote(a, "Container")
}(), function () {
    function a(a, b, c) {
        this.Container_constructor(), this.x = a, this.y = b, this.maxZoom = c || 10, this.minScaleX, this.maxScaleX, this.maxScaleY, this.scaleX = this.minScaleX, this.scaleY = this.minScaleY, this.grid, this.mapTiles = [], this.addEventListeners()
    }

    function b(a, b, d) {
        var h, g = new FileReader;
        g.onerror = c, g.onload = function (a) {
            h = JSON.parse(g.result).map, f(h, d, e)
        }, g.readAsText(a.target.files[0])
    }

    function c(a) {
        switch (a.target.error.code) {
            case a.target.error.NOT_FOUND_ERR:
                alert("File not found!");
                break;
            case a.target.error.NOT_READABLE_ERR:
                alert("File is not readable!");
                break;
            case a.target.error.ABORT_ERR:
                break;
            default:
                alert("An error occured reading this file.")
        }
    }

    function d(a, b) {
        var c = document.createElement("a"), d = URL.createObjectURL(a);
        c.display = "none", c.href = d, c.download = b, document.body.appendChild(c), c.click(), document.body.removeChild(c)
    }

    function e(a, b) {
        var c;
        for (var d in cPanel.panels) cPanel.panels[d] === cPanel.activePanel ? cPanel.populate(cPanel.panels[d], !0) : cPanel.populate(cPanel.panels[d], !1);
        a = a || [{id: "Tile-Mecatol_Rex", x: 0, y: 0, q: 0, r: 0, panel: "Planets"}];
        for (var e = 0; e < a.length; e++) {
            c = cPanel.panels[a[e].panel].getChildByName(a[e].id).clone(!0), c.parentPanel = cPanel.panels[a[e].panel], c.unique && cPanel.removeTile(c.clonedFrom, c.parentPanel), c.x = a[e].x, c.y = a[e].y, c.removeAllEventListeners();
            var f = c.clone(!0);
            f.removeAllEventListeners(), f.q = a[e].q, f.r = a[e].r, f.scaleX = f.scaleY = 1, f.rotation = a[e].rotation || 0, b.mapTiles[f.q + "." + f.r] = f, b.addChild(f), f.cursor = "default"
        }
        cPanel.populate(cPanel.activePanel, !0)
    }

    function f(a, b, c) {
        for (var d = b.children.length, e = 0; d > e; e++) b.children[0].deleteClick();
        cPanel.populate(cPanel.activePanel, !0), "function" == typeof c && c(a, b)
    }

    createjs.extend(a, createjs.Container), a.prototype.addEventListeners = function () {
        this.on("mousedown", this.mouseDown, this)
    }, a.prototype.loadJSON = function () {
        if (window.File && window.FileReader && window.Blob) {
            var a = document.createElement("input"), c = this;
            a.display = "none", a.type = "file", a.accept = ".t3m", a.addEventListener("change", function (d) {
                b(d, a, c)
            }, !1), a.click()
        } else alert("Your browser does not support the necessary File API")
    }, a.prototype.saveMapPNG = function () {
        if (window.File && window.FileReader && window.Blob) {
            var a = this.getBounds();
            this.cache(a.x, a.y, a.width, a.height), this.cacheCanvas.toBlob(function (a) {
                d(a, "map.png")
            }), this.uncache()
        } else alert("Your browser does not support the necessary File API")
    }, a.prototype.saveMapJSON = function () {
        if (window.File && window.FileReader && window.Blob) {
            for (var b, c, a = [], e = 0; e < this.children.length; e++) b = this.children[e], a.push({
                id: b.name,
                x: b.x,
                y: b.y,
                q: b.q,
                r: b.r,
                panel: b.parentPanel.name,
                rotation: b.rotation
            });
            a = JSON.stringify({map: a}), c = new Blob([a], {type: "application/vnd+TI3.map+json"}), d(c, "map.t3m")
        } else alert("Your browser does not support the necessary File API")
    }, a.prototype.mouseDown = function (a) {
        var b = {x: this.x - a.stageX, y: this.y - a.stageY}, c = this.on("pressmove", function (a) {
            this.x = a.stageX + b.x, this.y = a.stageY + b.y
        }, this), d = this.on("pressup", function () {
            this.off("pressmove", c), this.off("pressup", d)
        }, this)
    }, a.prototype.makeMap = function () {
        this.maxScaleX = this.maxScaleY = element.height / tileHeight, this.minScaleX = this.minScaleY = element.height / (tileHeight * this.maxZoom), this.scaleX = this.scaleY = this.minScaleX, this.grid = new Grid(tileWidth / 2, 0, !1, !0), e(null, this)
    }, a.prototype.newMap = function () {
        f(null, this, e)
    }, a.prototype.zoomMap = function (a) {
        var b, c = {x: a.stageX, y: a.stageY};
        this.globalToLocal(c.x, c.y, c), b = this.hitTest(c.x, c.y) ? this.getObjectUnderPoint(c.x, c.y, 1) : this;
        var d = b.getBounds(), e = element.height / d.height, f = element.width / d.width;
        cMap.scaleX = cMap.scaleY = f > e ? e : f;
        var c = b.localToGlobal(d.x, d.y);
        cMap.x -= c.x, cMap.y -= c.y
    }, a.prototype.mouseWheel = function (a, b) {
        var c = 120 * -a.detail || a.wheelDelta, d = this, e = d.regX, f = d.regY;
        d.regX = b.x, d.regY = b.y, c > 100 && (c = 100), -100 > c && (c = -100), d.scaleX = d.scaleX + c / 2500, d.scaleY = d.scaleY + c / 2500, c > 0 ? (d.scaleX > this.maxScaleX && (d.scaleX = this.maxScaleX), d.scaleY > this.maxScaleY && (d.scaleY = this.maxScaleY)) : (d.scaleX < this.minScaleX && (d.scaleX = this.minScaleX), d.scaleY < this.minScaleY && (d.scaleY = this.minScaleY));
        var g = new createjs.Matrix2D;
        g.appendTransform(d.x, d.y, d.scaleX, d.scaleY, d.rotation, d.skewX, d.skewY, -(b.x - e), -(b.y - f)), g.decompose(d)
    }, window.MapContainer = createjs.promote(a, "Container")
}(), function () {
    function a(a, b) {
        this.Container_constructor(), this.x = a, this.y = b, this.curX = a, this.panels = {
            Planets: new createjs.Container,
            Special: new createjs.Container,
            Homesystems: new createjs.Container,
            Tokens: new createjs.Container,
            Units: new createjs.Container
        };
        for (var c in this.panels) this.panels[c].tiles = [];
        this.activePanel = this.panels.Planets, this.bounds = new createjs.Graphics.RoundRect(0, 0, a - b / 2, element.height - 1.5 * b, 15, 15, 15, 15), this.border_length = new createjs.Graphics.LineTo(0, 0), this.border_height = new createjs.Graphics.LineTo(0, 0)
    }

    function o(a) {
        this.scroll(F(a.target.value, a.target.min, a.target.max, this.activePanel.currentHeight, 0), !0)
    }

    function p(a) {
        this.activePanel.scaleX = this.activePanel.scaleY = a.target.value, q(this, !0)
    }

    function q(a, b, c) {
        a.populate(a.activePanel), a.scroll(F(j.value, j.min, j.max, a.activePanel.currentHeight, 0), b, c), j.set({value: G(a.activePanel.y, j.min, j.max, a.activePanel.currentHeight, 0)})
    }

    function r(a) {
        var b = {x: this.x - a.stageX, y: this.y - a.stageY, w: this.bounds.w + a.stageX, h: this.bounds.h + a.stageY},
            c = this.on("pressmove", function (a) {
                var c = j.width + 2 * this.bounds.radiusTL, d = l.width + 2 * l.x, e = b.w - a.stageX,
                    f = b.h - a.stageY;
                e > d ? (this.bounds.w = e, this.x = a.stageX + b.x) : this.bounds.w = d, f > c ? (this.bounds.h = f, this.y = a.stageY + b.y) : this.bounds.h = c, z(this)
            }, this), d = this.on("pressup", function () {
                this.off("pressmove", c), this.off("pressup", d)
            }, this)
    }

    function s(a) {
        var b = {y: this.y - a.stageY, w: this.bounds.w - a.stageX, h: this.bounds.h + a.stageY},
            c = this.on("pressmove", function (a) {
                var c = j.width + 2 * this.bounds.radiusTL, d = b.h - a.stageY, e = l.width + 2 * l.x,
                    f = a.stageX + b.w;
                this.bounds.w = f > e ? f : e, d > c ? (this.bounds.h = d, this.y = a.stageY + b.y) : this.bounds.h = c, z(this)
            }, this), d = this.on("pressup", function () {
                this.off("pressmove", c), this.off("pressup", d)
            }, this)
    }

    function t(a) {
        var b = {x: this.x - a.stageX, w: this.bounds.w + a.stageX, h: this.bounds.h - a.stageY},
            c = this.on("pressmove", function (a) {
                var c = j.width + 2 * this.bounds.radiusTL, d = a.stageY + b.h, e = l.width + 2 * l.x,
                    f = b.w - a.stageX;
                this.bounds.h = d > c ? d : c, f > e ? (this.bounds.w = f, this.x = a.stageX + b.x) : this.bounds.w = e, z(this)
            }, this), d = this.on("pressup", function () {
                this.off("pressmove", c), this.off("pressup", d)
            }, this)
    }

    function u(a) {
        var b = {w: this.bounds.w - a.stageX, h: this.bounds.h - a.stageY}, c = this.on("pressmove", function (a) {
            var c = j.width + 2 * this.bounds.radiusTL, d = a.stageY + b.h, e = l.width + 2 * l.x, f = a.stageX + b.w;
            this.bounds.h = d > c ? d : c, this.bounds.w = f > e ? f : e, z(this)
        }, this), d = this.on("pressup", function () {
            this.off("pressmove", c), this.off("pressup", d)
        }, this)
    }

    function v(a) {
        var b = {x: this.x - a.stageX, w: this.bounds.w + a.stageX}, c = this.on("pressmove", function (a) {
            var c = l.width + 2 * l.x, d = b.w - a.stageX;
            d > c ? (this.bounds.w = d, this.x = a.stageX + b.x) : this.bounds.w = c, z(this)
        }, this), d = this.on("pressup", function () {
            this.off("pressmove", c), this.off("pressup", d)
        }, this)
    }

    function w(a) {
        var b = {w: this.bounds.w - a.stageX}, c = this.on("pressmove", function (a) {
            var c = l.width + 2 * l.x, d = a.stageX + b.w;
            this.bounds.w = d > c ? d : c, z(this)
        }, this), d = this.on("pressup", function () {
            this.off("pressmove", c), this.off("pressup", d)
        }, this)
    }

    function x(a) {
        var b = {y: this.y - a.stageY, h: this.bounds.h + a.stageY}, c = this.on("pressmove", function (a) {
            var c = j.width + 2 * this.bounds.radiusTL, d = b.h - a.stageY;
            d > c ? (this.bounds.h = d, this.y = a.stageY + b.y) : this.bounds.h = c, z(this)
        }, this), d = this.on("pressup", function () {
            this.off("pressmove", c), this.off("pressup", d)
        }, this)
    }

    function y(a) {
        var b = {h: this.bounds.h - a.stageY}, c = this.on("pressmove", function (a) {
            var c = j.width + 2 * this.bounds.radiusTL, d = a.stageY + b.h;
            this.bounds.h = d > c ? d : c, z(this)
        }, this), d = this.on("pressup", function () {
            this.off("pressmove", c), this.off("pressup", d)
        }, this)
    }

    function z(a) {
        var b = {
                x: a.bounds.x - j.height,
                y: a.bounds.y - l.height,
                w: a.bounds.w + 2 * j.height,
                h: a.bounds.h + 2 * l.height
            }, e = (a.bounds.w - a.bounds.radiusTL) / (tileWidth + 60),
            f = (a.bounds.h - a.bounds.radiusTL) / (tileHeight + 60);
        l.y = a.bounds.h - l.height / 2, l.max = e > f ? f : e, a.activePanel.scaleX > l.max && (a.activePanel.scaleX = a.activePanel.scaleY = l.max), m.y = l.y, j.x = a.bounds.w - j.height / 2, k.x = j.x, g.x = a.bounds.w, h.x = a.bounds.w, h.y = a.bounds.h, i.y = a.bounds.h, d.y = a.bounds.h, c.x = a.bounds.w, a.border_length.x = a.bounds.w - a.bounds.radiusTL, a.border_height.y = a.bounds.h - a.bounds.radiusTL, q(a, !1, b)
    }

    function A(a, b, c) {
    }

    function B(a, j) {
        f = new createjs.Shape, f.graphics.ss(j, "butt").rs(["#333", "#FFF", "#333"], [0, .5, 1], a.bounds.radiusTL, a.bounds.radiusTL, a.bounds.radiusTL - j / 2, a.bounds.radiusTL, a.bounds.radiusTL, a.bounds.radiusTL + j / 2).mt(a.bounds.x, a.bounds.radiusTL).qt(a.bounds.x, a.bounds.y, a.bounds.radiusTL, a.bounds.y), f.cursor = "nwse-resize", g = f.clone(), g.rotation = 90, g.cursor = "nesw-resize", h = f.clone(), h.rotation = 180, h.cursor = "nwse-resize", i = f.clone(), i.rotation = 270, i.cursor = "nesw-resize", b = new createjs.Shape, b.graphics.ss(j, "butt").ls(["#333", "#FFF", "#333"], [0, .5, 1], 0, -j / 2, 0, j / 2).mt(a.bounds.radiusTL, a.bounds.y).append(a.border_length), b.cursor = "ns-resize", d = b.clone(), d.cursor = "ns-resize", e = new createjs.Shape, e.graphics.ss(j, "butt").ls(["#333", "#FFF", "#333"], [0, .5, 1], -j / 2, 0, j / 2, 0).mt(a.bounds.x, a.bounds.radiusTL).append(a.border_height), e.cursor = "ew-resize", c = e.clone(), c.cursor = "ew-resize"
    }

    function C(a, b) {
        a.activePanel.zoomVal = l.value, a.activePanel.scrollVal = j.value, a.activePanel.visible = !1, a.swapChildren(b, a.activePanel), a.activePanel = b, a.populate(a.activePanel, !0), a.activePanel.visible = !0, l.set({value: a.activePanel.zoomVal || a.activePanel.scaleX}), j.set({value: a.activePanel.scrollVal || 0}), A(a, !0)
    }

    function D(a) {
        var b = {x: this.x - a.stageX, y: this.y - a.stageY}, c = this.on("pressmove", function (a) {
            this.x = a.stageX + b.x, this.y = a.stageY + b.y
        }, this), d = this.on("pressup", function () {
            this.off("pressmove", c), this.off("pressup", d)
        }, this)
    }

    function E(a, b) {
        return a.name > b.name ? 1 : a.name < b.name ? -1 : 0
    }

    function F(a, b, c, d, e) {
        return (a - b) / (c - b) * (-d - e) + e
    }

    function G(a, b, c, d, e) {
        return (c - b) * (a - e) / (-d - e) + b
    }

    function H(a) {
        f.on("mousedown", r, a), i.on("mousedown", t, a), g.on("mousedown", s, a), h.on("mousedown", u, a), c.on("mousedown", w, a), d.on("mousedown", y, a), e.on("mousedown", v, a), b.on("mousedown", x, a), l.on("change", p, a), j.on("change", o, a), n.on("mousedown", D, a)
    }

    function I(a, b, c, d) {
        var e, f, g, h, i, j;
        e = {x: 0, y: b / 2}, f = {x: b, y: 0}, g = {x: a - b, y: 0}, h = {x: a, y: b / 2}, i = {
            x: a - b,
            y: b
        }, j = {x: b, y: b};
        var k = new createjs.Shape;
        return k.graphics.s(c).ss(d).lt(e.x, e.y).lt(f.x, f.y).lt(g.x, g.y).lt(h.x, h.y).lt(i.x, i.y).lt(j.x, j.y).lt(e.x, e.y), k
    }

    createjs.extend(a, createjs.Container);
    var b, c, d, e, f, g, h, i, j, k, l, m, n;
    a.prototype.slideIn = function () {
        new createjs.Tween(this).to({x: this.curX}, 750, createjs.Ease.quadOut)
    }, a.prototype.slideOut = function () {
        this.curX == this.x && (this.curX = this.x);
        new createjs.Tween(this).to({x: element.width + 10}, 750, createjs.Ease.quadIn)
    }, a.prototype.scroll = function (a, b, c) {
        this.activePanel.currentHeight + this.bounds.h > this.bounds.h ? this.activePanel.y = a : this.activePanel.y = 0, A(this, b, c)
    }, a.prototype.makePanel = function () {
        l = new Slider(.1, (this.bounds.w - this.y / 2) / (tileWidth + 60), this.bounds.w / 3, 15), m = I(l.width, l.height, "red", 1), j = new Slider(0, 100, .5 * this.bounds.h, 15), k = I(j.width, j.height, "red", 1), n = new createjs.Shape;
        var a;
        n.graphics.f("grey").append(this.bounds), n.alpha = .5, l.set({
            value: l.max / 3,
            mask: m
        }), l.x = this.y / 2, j.set({
            value: 0,
            regX: 15,
            regY: 15,
            rotation: 90,
            mask: k
        }), j.y = this.y / 2, k.set({regX: j.height, regY: j.height, rotation: 90}), k.y = j.y, m.x = l.x;
        for (var o in this.panels) a = this.panels[o], a.name = o, a.visible = !1, a.currentTilesPerRow = 0, a.currentHeight = 0, a.mask = n, a.scaleX = a.scaleY = l.value, a.tiles.sort(E), this.addChild(a), this.populate(a);
        this.activePanel.visible = !0, B(this, 5), this.addChild(f, g, h, i, b, d, e, c, j, l, m, k), this.addChildAt(n, 0), H(this), this.x = element.width + 10, z(this)
    }, a.prototype.changePanel = function (a) {
        a = this.panels[a], C(this, a), this.slideIn()
    }, a.prototype.mouseWheel = function (a) {
        var d, b = 120 * -a.detail || a.wheelDelta, c = 100;
        b > 100 && (b = 100), -100 > b && (b = -100), d = j.value - b / c, d < j.min && (d = j.min), d > j.max && (d = j.max), j.set({value: d}), this.scroll(F(d, j.min, j.max, this.activePanel.currentHeight, 0), !0)
    }, a.prototype.addTile = function (a, b) {
        b.tiles.push(a), a.cursor = "pointer", a.on("mousedown", a.handleMouseDown), b.tiles.sort(E)
    }, a.prototype.removeTile = function (a, b) {
        var c = b.tiles.indexOf(a);
        c >= 0 && b.tiles.splice(c, 1)
    }, a.prototype.populate = function (a, b) {
        var c = 20, d = Math.floor(this.bounds.w / ((tileWidth + 3 * c) * a.scaleX));
        if (a.currentTilesPerRow != d || b) {
            a.removeAllChildren();
            for (var g, h, e = 0, f = 0, i = 0; i < a.tiles.length; i++) g = a.tiles[i], h = new createjs.Shape, h.graphics.beginStroke("lightgray").setStrokeStyle(5).drawRoundRect(c + f * (tileWidth + 3 * c), c + e * (tileHeight + 3 * c), tileWidth + 2 * c, tileHeight + 2 * c, c), g.x = 2 * c + f * (tileWidth + 3 * c) + tileWidth / 2, g.y = 2 * c + e * (tileHeight + 3 * c) + tileHeight / 2, g.parentPanel = a, a.addChild(h, g), f == d - 1 && e != a.tiles.length - 1 ? (f = 0, e++) : f++
        }
        a.currentTilesPerRow = d, a.currentHeight = (2 * c + (tileHeight + 3 * c) * Math.ceil(a.tiles.length / d)) * a.scaleX - this.bounds.h
    }, window.PanelContainer = createjs.promote(a, "Container")
}(), function () {
    function a(a, b, c, d) {
        this.Shape_constructor(), this.min = this.value = a || 0, this.max = b || 100, this.width = c || 100, this.height = d || 20, this.values = {}, this.trackColor = "#EEE", this.thumbColor = "#666", this.cursor = "pointer", this.on("mousedown", this._handleInput, this), this.on("pressmove", this._handleInput, this)
    }

    var b = createjs.extend(a, createjs.Shape);
    b.isVisible = function () {
        return !0
    }, b.draw = function (a, b) {
        if (this._checkChange()) {
            var c = (this.width - this.height) * Math.max(0, Math.min(1, (this.value - this.min) / (this.max - this.min)));
            this.graphics.clear().beginFill(this.trackColor).drawRect(0, 0, this.width, this.height).beginFill(this.thumbColor).drawRect(c, 0, this.height, this.height)
        }
        this.Shape_draw(a, !0)
    }, b._checkChange = function () {
        var a = this, b = a.values;
        return a.value !== b.value || a.min !== b.min || a.max !== b.max || a.width !== b.width || a.height !== b.height ? (b.min = a.min, b.max = a.max, b.value = a.value, b.width = a.width, b.height = a.height, !0) : !1
    }, b._handleInput = function (a) {
        var b = (a.localX - this.height / 2) / (this.width - this.height) * (this.max - this.min) + this.min;
        b = Math.max(this.min, Math.min(this.max, b)), b != this.value && (this.value = b, this.dispatchEvent("change"))
    }, window.Slider = createjs.promote(a, "Shape")
}(), $(document).ready(init);
var element, starfield, stage, cMap, cPanel, loaderbar, logoloader, loader, tileWidth, tileHeight;
createjs.Ticker.framerate = 50, createjs.Ticker.addEventListener("tick", loadertick);