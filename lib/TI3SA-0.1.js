"use strict";

function Grid(e, t, i, s) {
    this.tileSize = e || 100, this.tileSpacing = t || 0, this.pointyTiles = i || !1, this.withOrigin = s || !0
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

function handleKeyUp(e) {
    cMap.cursor = "default";
    for (var t in cMap.children) {
        var i = cMap.children[t];
        i.removeAllEventListeners()
    }
}

function handleKeyDown(e) {
    if (cMap.editing) {
        if (e.altKey) {
            e.stopImmediatePropagation(), cMap.cursor = "move";
            for (var t in cMap.children) {
                var i = cMap.children[t];
                i.on("mousedown", i.handleMouseDown, i, !0)
            }
        }
        if (e.shiftKey) {
            e.stopImmediatePropagation(), cMap.cursor = "no-drop";
            for (var t in cMap.children) if (cMap.children[t] instanceof MapObject) {
                var i = cMap.children[t];
                i.on("click", i.deleteClick, i, !0, {update: !0})
            }
        }
    }
}

function loadedloader(e) {
    loaderbar = new Loaderbar(element.width / 2, element.height / 2, logoloader.getResult("mecImg"), logoloader.getResult("logo")), stage.addChild(loaderbar), loader.load()
}

function handleMouseWheel(e) {
    var t = stage.mouseX, i = stage.mouseY, s = cMap.globalToLocal(t, i), a = cPanel.globalToLocal(t, i);
    cPanel.hitTest(a.x, a.y) ? cPanel.mouseWheel(e) : cMap.mouseWheel(e, s)
}

function queueProgress(e) {
    loaderbar.logo.mask.scaleX = e.progress
}

function fileloaded(e) {
    makeStars();
    var t;
    if ("image" == e.item.type)
        switch (t = e.item.id, t = t.split("-"), t[0]) {
        case"Tile":
            var i = new Tile(e.item, e.result);
            if ("HS" == t[1].split("_")[0]) {
                cPanel.panels.Homesystems.tiles.push(i);
                break
            }
            if (null == i.planets) {
                cPanel.panels.Special.tiles.push(i);
                break
            }
            "Tile-Mecatol_Rex" == i.name && (tileWidth = i.bounds.width, tileHeight = i.bounds.height), cPanel.panels.Planets.tiles.push(i);
            break;
        case"Token":
            switch (t[1]) {
                case"AsteroidBelt":
                case"AsteSpaceTimeAnomaly":
                case"AsteIonSphere":
                case"AsteStandingGravWave":
                case"AsteStandingGravWave_rotated180":
                    var s = new AsteroidBelt(e.item, e.result);
                    cPanel.panels.Tokens.tiles.push(s);
                    break;
                case"Artifact":
                    var a = new Artifact(e.item, e.result);
                    cPanel.panels.Tokens.tiles.push(a);
                    break;
                case"DistantSuns":
                    var n = new DistantSun(e.item, e.result);
                    cPanel.panels.Tokens.tiles.push(n);
                    break;
                case"SpaceDomain":
                    var n = new DistantSun(e.item, e.result);
                    cPanel.panels.Tokens.tiles.push(n);
                    break;
                case"Wormhole":
                    var o = new Wormhole(e.item, e.result);
                    cPanel.panels.Tokens.tiles.push(o)
            }
            break;
        case"Unit":
            var unit = new Unit(e.item, e.result);
            cPanel.panels.Units.tiles.push(unit);
            break;
        case"CC":
            var counter = new Counter(e.item, e.result);
            cPanel.panels.Counters.tiles.push(counter);
            break;
        case"Flag":
            var flag = new Counter(e.item, e.result);
            cPanel.panels.Counters.tiles.push(flag);
            break;
        case"Misc":
            var misc = new Counter(e.item, e.result);
            cPanel.panels.Misc.tiles.push(misc);
            break;
    }
}

function queueLoaded() {
    loaderbar.glowAndFade()
}

function tick(e) {
    stage.update()
}

function loadertick(e) {
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

function stardust(e, t) {
    var i = 64, s = 3, a = new createjs.BitmapData(null, element.width / i, element.height / i), n = a.width / s,
        o = a.height / s, r = Math.random(), h = Object.create(createjs.BitmapDataChannel), l = e | h.ALPHA, c = "cos";
    a.perlinNoise(n, o, s, r, !1, !1, l, !1, null, c);
    var u = new createjs.Bitmap(a.canvas);
    return u.scaleX = u.scaleY = i, u.alpha = t, u
}

function makeStars() {
    for (var e = 0; 25 >= e; e++) starfield.graphics.beginFill(createjs.Graphics.getRGB(16777215, Math.random())).drawPolyStar(Math.random() * element.width, Math.random() * element.height, 4 * Math.random() + 1, 5, .93, 360 * Math.random()), starfield.updateCache("source-overlay"), starfield.graphics.clear()
}

var module = module || {};
Grid.prototype.ringCoordinates = function (e, t, i) {
    var s = this.hexagonCoordinates(e, t, i, !0);
    return this.withOrigin && s.shift(0), s
}, Grid.prototype.hexagonCoordinates = function (e, t, i, s) {
    var a = [], n = [[1, 0], [0, -1], [-1, 0], [-1, 1], [0, 1], [1, 0], [1, -1]];
    this.withOrigin && a.push({q: e, r: t});
    for (var o, r, h, l, c = s ? i : 1; i >= c; c++) for (o = e, r = t, l = 0; l < n.length; l++) for (h = 0; c > h; h++) o += n[l][0], r += n[l][1], 0 != l && a.push({
        q: o,
        r: r
    });
    return a
}, Grid.prototype.getCenterXY = function (e, t) {
    var i, s;
    return this.pointyTiles ? (i = (this.tileSize + this.tileSpacing) * Math.sqrt(3) * (e + t / 2), s = -(3 * (this.tileSize + this.tileSpacing) / 2 * t)) : (i = 3 * (this.tileSize + this.tileSpacing) / 2 * e, s = -((this.tileSize + this.tileSpacing) * Math.sqrt(3) * (t + e / 2))), {
        x: i,
        y: s
    }
}, Grid.prototype.pixelToDecimalQR = function (e, t, i) {
    var s, a;
    return "number" != typeof i && (i = 1), this.tilePointy ? (s = (1 / 3 * Math.sqrt(3) * e - 1 / 3 * -t) / (this.tileSize + this.tileSpacing), a = 2 / 3 * -t / (this.tileSize + this.tileSpacing)) : (s = 2 / 3 * e / (this.tileSize + this.tileSpacing), a = (1 / 3 * Math.sqrt(3) * -t - 1 / 3 * e) / (this.tileSize + this.tileSpacing)), s /= i, a /= i, {
        q: s,
        r: a
    }
}, Grid.prototype.pixelToIntegerQR = function (e, t, i) {
    var s, a;
    return "number" != typeof i && (i = 1), this.tilePointy ? (s = (1 / 3 * Math.sqrt(3) * e - 1 / 3 * -t) / (this.tileSize + this.tileSpacing), a = 2 / 3 * -t / (this.tileSize + this.tileSpacing)) : (s = 2 / 3 * e / (this.tileSize + this.tileSpacing), a = (1 / 3 * Math.sqrt(3) * -t - 1 / 3 * e) / (this.tileSize + this.tileSpacing)), s /= i, a /= i, {
        q: Math.round(s),
        r: Math.round(a)
    }
}, Grid.prototype.neighborCoordinates = function (e, t) {
    for (var i = [], s = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]], a = 0; 6 > a; a++) {
        var n = s[a];
        i.push({q: e + n[0], r: t + n[1]})
    }
    return i
}, Grid.prototype.axialDistance = function (e, t, i, s) {
    return (Math.abs(e - i) + Math.abs(t - s) + Math.abs(e + t - i - s)) / 2
}, Grid.prototype.pixelToAxial = function (e, t) {
    var i = this.pixelToDecimalQR(e, t), s = this.axialToCube(i), a = this.roundCube(s);
    return this.cubeToAxial(a)
}, Grid.prototype.roundCube = function (e) {
    var t = Math.round(e.x), i = Math.round(e.y), s = Math.round(e.z), a = Math.abs(t - e.x), n = Math.abs(i - e.y),
        o = Math.abs(s - e.z);
    return a > n && a > o ? t = -i - s : n > o ? i = -t - s : s = -t - i, {x: t, y: i, z: s}
}, Grid.prototype.cubeToAxial = function (e) {
    return {q: e.x, r: e.y}
}, Grid.prototype.axialToCube = function (e) {
    return {x: e.q, y: e.r, z: -e.q - e.r}
}, Grid.prototype.hexCorner = function (e, t) {
    var i = 60 * -t, s = Math.PI / 180 * i;
    return {x: e.x + this.tileSize * -Math.cos(s), y: e.y + this.tileSize * -Math.sin(s)}
}, Grid.prototype.angle = function (e, t) {
    return Math.atan2(t.y - e.y, e.x - t.x)
}, Grid.prototype.triangle = function (e, t) {
    return Math.ceil(this.angle(e, t) / (Math.PI / 3))
}, module.exports = Grid, $(document).ready(init);
var element, starfield, stage, cMap, cPanel, loaderbar, logoloader, loader, tileWidth, tileHeight;
createjs.Ticker.framerate = 50, createjs.Ticker.addEventListener("tick", loadertick), function () {
    function e(e, i, s, a) {
        this.Container_constructor(), this.x = e, this.y = i;
        var n = new createjs.Bitmap(s);
        this.logo = new createjs.Bitmap(a);
        var o = [new createjs.BlurFilter(10, 10, 1), new createjs.ColorFilter(0, 0, 0, 1.5, 0, 150, 255)],
            r = new createjs.ColorMatrix;
        r.adjustSaturation(-100), r.adjustContrast(50);
        var h = [new createjs.ColorMatrixFilter(r)];
        n.regX = s.width / 2, n.regY = s.height / 2, this.logo.regX = a.width / 2, this.logo.regY = a.height / 2;
        var l = t(this.logo, h, 0, 0, a.width, a.height, 1);
        this.logoFX = t(this.logo, o, 0, 0, a.width, a.height, 0);
        var c = new createjs.Shape;
        c.graphics.drawRect(-a.width / 2, -a.height / 2, a.width, a.height), this.logo.mask = c, this.addChild(n, l, this.logo, this.logoFX)
    }

    function t(e, t, i, s, a, n, o) {
        e.cache(i, s, a, n);
        var r = new createjs.Bitmap(e.cacheCanvas);
        return r.filters = t, r.cache(0, 0, a, n), r.regX = e.regX, r.regY = e.regY, r.alpha = o, e.uncache(), r
    }

    createjs.extend(e, createjs.Container), e.prototype.glowAndFade = function () {
        var e = new createjs.Tween(this, {paused: !0}).to({alpha: 0}, 500);
        new createjs.Tween(this.logoFX).wait(100).to({alpha: 1}, 500).wait(100).to({alpha: .75}, 500).play(e)
    }, window.Loaderbar = createjs.promote(e, "Container")
}(), function () {
    function e(e, t, i) {
        this.Container_constructor(), this.x = e, this.y = t, this.maxZoom = i || 10, this.minScaleX, this.maxScaleX, this.maxScaleY, this.scaleX = this.minScaleX, this.scaleY = this.minScaleY, this.grid, this.mapTiles = [], this.addEventListeners()
    }

    function t(e, t, s) {
        var o, r = new FileReader;
        r.onerror = i, r.onload = function (e) {
            o = JSON.parse(r.result).map, n(o, s, a)
        }, r.readAsText(e.target.files[0])
    }

    function i(e) {
        switch (e.target.error.code) {
            case e.target.error.NOT_FOUND_ERR:
                alert("File not found!");
                break;
            case e.target.error.NOT_READABLE_ERR:
                alert("File is not readable!");
                break;
            case e.target.error.ABORT_ERR:
                break;
            default:
                alert("An error occured reading this file.")
        }
    }

    function s(e, t) {
        var i = document.createElement("a"), s = URL.createObjectURL(e);
        i.display = "none", i.href = s, i.download = t, document.body.appendChild(i), i.click(), document.body.removeChild(i)
    }

    function a(e, t) {
        var i;
        for (var s in cPanel.panels) cPanel.panels[s] === cPanel.activePanel ? cPanel.populate(cPanel.panels[s], !0) : cPanel.populate(cPanel.panels[s], !1);
        e = e || [{id: "Tile-Mecatol_Rex", x: 0, y: 0, q: 0, r: 0, panel: "Planets"}];
        for (var a = 0; a < e.length; a++) {
            i = cPanel.panels[e[a].panel].getChildByName(e[a].id).clone(!0),
                i.parentPanel = cPanel.panels[e[a].panel], i.unique && cPanel.removeTile(i.clonedFrom, i.parentPanel),
                i.x = e[a].x, i.y = e[a].y, i.removeAllEventListeners();
            var n = i.clone(!0);
            n.removeAllEventListeners(), n.q = e[a].q, n.r = e[a].r, n.scaleX = n.scaleY = 1, n.rotation = e[a].rotation || 0, t.mapTiles[n.q + "." + n.r] = n, t.addChild(n), n.cursor = "default"
        }
        cPanel.populate(cPanel.activePanel, !0)
    }

    function n(e, t, i) {
        for (var s = t.children.length, a = 0; s > a; a++) t.children[0].deleteClick();
        cPanel.populate(cPanel.activePanel, !0), "function" == typeof i && i(e, t)
    }

    createjs.extend(e, createjs.Container), e.prototype.addEventListeners = function () {
        this.on("mousedown", this.mouseDown, this)
    }, e.prototype.loadJSON = function () {
        if (window.File && window.FileReader && window.Blob) {
            var e = document.createElement("input"), i = this;
            e.display = "none", e.type = "file", e.accept = ".t3m", e.addEventListener("change", function (s) {
                t(s, e, i)
            }, !1), e.click()
        } else alert("Your browser does not support the necessary File API")
    }, e.prototype.saveMapPNG = function () {
        if (window.File && window.FileReader && window.Blob) {
            var e = this.getBounds(), t = tileWidth / 2, i = new createjs.Shape;
            i.graphics.f("black").r(e.x - t, e.y - t, e.width + 2 * t, e.height + 2 * t), this.addChildAt(i, 0), this.cache(e.x - t, e.y - t, e.width + 2 * t, e.height + 2 * t), this.cacheCanvas.toBlob(function (e) {
                s(e, "map.png")
            }), this.removeChild(i), this.uncache()
        } else alert("Your browser does not support the necessary File API")
    }, e.prototype.saveMapJSON = function () {
        if (window.File && window.FileReader && window.Blob) {
            for (var e, t, i = [], a = 0; a < this.children.length; a++) e = this.children[a], i.push({
                id: e.name,
                x: e.x,
                y: e.y,
                q: e.q,
                r: e.r,
                panel: e.parentPanel.name,
                rotation: e.rotation
            });
            i = JSON.stringify({map: i}), t = new Blob([i], {type: "application/vnd+TI3.map+json"}), s(t, "map.t3m")
        } else alert("Your browser does not support the necessary File API")
    }, e.prototype.mouseDown = function (e) {
        var t = {x: this.x - e.stageX, y: this.y - e.stageY}, i = this.on("pressmove", function (e) {
            this.x = e.stageX + t.x, this.y = e.stageY + t.y
        }, this), s = this.on("pressup", function () {
            this.off("pressmove", i), this.off("pressup", s)
        }, this)
    }, e.prototype.makeMap = function () {
        this.maxScaleX = this.maxScaleY = element.height / tileHeight, this.minScaleX = this.minScaleY = element.height / (tileHeight * this.maxZoom), this.scaleX = this.scaleY = this.minScaleX, this.grid = new Grid(tileWidth / 2, 0, !1, !0), a(null, this)
    }, e.prototype.newMap = function () {
        n(null, this, a)
    }, e.prototype.zoomMap = function (e) {
        var t, i = {x: e.stageX, y: e.stageY};
        this.globalToLocal(i.x, i.y, i), t = this.hitTest(i.x, i.y) ? this.getObjectUnderPoint(i.x, i.y, 1) : this;
        var s = t.getBounds(), a = element.height / s.height, n = element.width / s.width;
        cMap.scaleX = cMap.scaleY = n > a ? a : n;
        var i = t.localToGlobal(s.x, s.y);
        cMap.x -= i.x, cMap.y -= i.y
    }, e.prototype.mouseWheel = function (e, t) {
        var i = 120 * -e.detail || e.wheelDelta, s = this, a = s.regX, n = s.regY;
        s.regX = t.x, s.regY = t.y, i > 100 && (i = 100), -100 > i && (i = -100), s.scaleX = s.scaleX + i / 2500, s.scaleY = s.scaleY + i / 2500, i > 0 ? (s.scaleX > this.maxScaleX && (s.scaleX = this.maxScaleX), s.scaleY > this.maxScaleY && (s.scaleY = this.maxScaleY)) : (s.scaleX < this.minScaleX && (s.scaleX = this.minScaleX), s.scaleY < this.minScaleY && (s.scaleY = this.minScaleY));
        var o = new createjs.Matrix2D;
        o.appendTransform(s.x, s.y, s.scaleX, s.scaleY, s.rotation, s.skewX, s.skewY, -(t.x - a), -(t.y - n)), o.decompose(s)
    }, window.MapContainer = createjs.promote(e, "Container")
}(), function () {
    function e(e, t) {
        this.Container_constructor(), this.x = e, this.y = t, this.curX = e, this.panels = {
            Planets: new createjs.Container,
            Special: new createjs.Container,
            Homesystems: new createjs.Container,
            Tokens: new createjs.Container,
            Units: new createjs.Container,
            Counters: new createjs.Container,
            Misc: new createjs.Container
        };
        for (var i in this.panels) this.panels[i].tiles = [];
        this.activePanel = this.panels.Planets, this.bounds = new createjs.Graphics.RoundRect(0, 0, e - t / 2, element.height - 1.5 * t, 15, 15, 15, 15), this.border_length = new createjs.Graphics.LineTo(0, 0), this.border_height = new createjs.Graphics.LineTo(0, 0)
    }

    function t(e) {
        this.scroll(v(e.target.value, e.target.min, e.target.max, this.activePanel.currentHeight, 0), !0)
    }

    function i(e) {
        this.activePanel.scaleX = this.activePanel.scaleY = e.target.value, s(this, !0)
    }

    function s(e, t, i) {
        e.populate(e.activePanel), e.scroll(v(C.value, C.min, C.max, e.activePanel.currentHeight, 0), t, i), C.set({value: b(e.activePanel.y, C.min, C.max, e.activePanel.currentHeight, 0)})
    }

    function a(e) {
        var t = {x: this.x - e.stageX, y: this.y - e.stageY, w: this.bounds.w + e.stageX, h: this.bounds.h + e.stageY},
            i = this.on("pressmove", function (e) {
                var i = C.width + 2 * this.bounds.radiusTL, s = F.width + 2 * F.x, a = t.w - e.stageX,
                    n = t.h - e.stageY;
                a > s ? (this.bounds.w = a, this.x = e.stageX + t.x) : this.bounds.w = s, n > i ? (this.bounds.h = n, this.y = e.stageY + t.y) : this.bounds.h = i, d(this)
            }, this), s = this.on("pressup", function () {
                this.off("pressmove", i), this.off("pressup", s)
            }, this)
    }

    function n(e) {
        var t = {y: this.y - e.stageY, w: this.bounds.w - e.stageX, h: this.bounds.h + e.stageY},
            i = this.on("pressmove", function (e) {
                var i = C.width + 2 * this.bounds.radiusTL, s = t.h - e.stageY, a = F.width + 2 * F.x,
                    n = e.stageX + t.w;
                this.bounds.w = n > a ? n : a, s > i ? (this.bounds.h = s, this.y = e.stageY + t.y) : this.bounds.h = i, d(this)
            }, this), s = this.on("pressup", function () {
                this.off("pressmove", i), this.off("pressup", s)
            }, this)
    }

    function o(e) {
        var t = {x: this.x - e.stageX, w: this.bounds.w + e.stageX, h: this.bounds.h - e.stageY},
            i = this.on("pressmove", function (e) {
                var i = C.width + 2 * this.bounds.radiusTL, s = e.stageY + t.h, a = F.width + 2 * F.x,
                    n = t.w - e.stageX;
                this.bounds.h = s > i ? s : i, n > a ? (this.bounds.w = n, this.x = e.stageX + t.x) : this.bounds.w = a, d(this)
            }, this), s = this.on("pressup", function () {
                this.off("pressmove", i), this.off("pressup", s)
            }, this)
    }

    function r(e) {
        var t = {w: this.bounds.w - e.stageX, h: this.bounds.h - e.stageY}, i = this.on("pressmove", function (e) {
            var i = C.width + 2 * this.bounds.radiusTL, s = e.stageY + t.h, a = F.width + 2 * F.x, n = e.stageX + t.w;
            this.bounds.h = s > i ? s : i, this.bounds.w = n > a ? n : a, d(this)
        }, this), s = this.on("pressup", function () {
            this.off("pressmove", i), this.off("pressup", s)
        }, this)
    }

    function h(e) {
        var t = {x: this.x - e.stageX, w: this.bounds.w + e.stageX}, i = this.on("pressmove", function (e) {
            var i = F.width + 2 * F.x, s = t.w - e.stageX;
            s > i ? (this.bounds.w = s, this.x = e.stageX + t.x) : this.bounds.w = i, d(this)
        }, this), s = this.on("pressup", function () {
            this.off("pressmove", i), this.off("pressup", s)
        }, this)
    }

    function l(e) {
        var t = {w: this.bounds.w - e.stageX}, i = this.on("pressmove", function (e) {
            var i = F.width + 2 * F.x, s = e.stageX + t.w;
            this.bounds.w = s > i ? s : i, d(this)
        }, this), s = this.on("pressup", function () {
            this.off("pressmove", i), this.off("pressup", s)
        }, this)
    }

    function c(e) {
        var t = {y: this.y - e.stageY, h: this.bounds.h + e.stageY}, i = this.on("pressmove", function (e) {
            var i = C.width + 2 * this.bounds.radiusTL, s = t.h - e.stageY;
            s > i ? (this.bounds.h = s, this.y = e.stageY + t.y) : this.bounds.h = i, d(this)
        }, this), s = this.on("pressup", function () {
            this.off("pressmove", i), this.off("pressup", s)
        }, this)
    }

    function u(e) {
        var t = {h: this.bounds.h - e.stageY}, i = this.on("pressmove", function (e) {
            var i = C.width + 2 * this.bounds.radiusTL, s = e.stageY + t.h;
            this.bounds.h = s > i ? s : i, d(this)
        }, this), s = this.on("pressup", function () {
            this.off("pressmove", i), this.off("pressup", s)
        }, this)
    }

    function d(e) {
        var t = {
                x: e.bounds.x - C.height,
                y: e.bounds.y - F.height,
                w: e.bounds.w + 2 * C.height,
                h: e.bounds.h + 2 * F.height
            }, i = (e.bounds.w - e.bounds.radiusTL) / (tileWidth + 60),
            a = (e.bounds.h - e.bounds.radiusTL) / (tileHeight + 60);
        F.y = e.bounds.h - F.height / 2, F.max = i > a ? a : i, e.activePanel.scaleX > F.max && (e.activePanel.scaleX = e.activePanel.scaleY = F.max), R.y = F.y, C.x = e.bounds.w - C.height / 2, L.x = C.x, k.x = e.bounds.w, j.x = e.bounds.w, j.y = e.bounds.h, Y.y = e.bounds.h, S.y = e.bounds.h, M.x = e.bounds.w, e.border_length.x = e.bounds.w - e.bounds.radiusTL, e.border_height.y = e.bounds.h - e.bounds.radiusTL, s(e, !1, t)
    }

    function p(e, t, i) {
    }

    function g(e, t) {
        X = new createjs.Shape, X.graphics.ss(t, "butt").rs(["#333", "#FFF", "#333"], [0, .5, 1], e.bounds.radiusTL, e.bounds.radiusTL, e.bounds.radiusTL - t / 2, e.bounds.radiusTL, e.bounds.radiusTL, e.bounds.radiusTL + t / 2).mt(e.bounds.x, e.bounds.radiusTL).qt(e.bounds.x, e.bounds.y, e.bounds.radiusTL, e.bounds.y), X.cursor = "nwse-resize", k = X.clone(), k.rotation = 90, k.cursor = "nesw-resize", j = X.clone(), j.rotation = 180, j.cursor = "nwse-resize", Y = X.clone(), Y.rotation = 270, Y.cursor = "nesw-resize", P = new createjs.Shape, P.graphics.ss(t, "butt").ls(["#333", "#FFF", "#333"], [0, .5, 1], 0, -t / 2, 0, t / 2).mt(e.bounds.radiusTL, e.bounds.y).append(e.border_length), P.cursor = "ns-resize", S = P.clone(), S.cursor = "ns-resize", T = new createjs.Shape, T.graphics.ss(t, "butt").ls(["#333", "#FFF", "#333"], [0, .5, 1], -t / 2, 0, t / 2, 0).mt(e.bounds.x, e.bounds.radiusTL).append(e.border_height), T.cursor = "ew-resize", M = T.clone(), M.cursor = "ew-resize"
    }

    function m(e, t) {
        e.activePanel.zoomVal = F.value, e.activePanel.scrollVal = C.value, e.activePanel.visible = !1, e.swapChildren(t, e.activePanel), e.activePanel = t, e.populate(e.activePanel, !0), e.activePanel.visible = !0, F.set({value: e.activePanel.zoomVal || e.activePanel.scaleX}), C.set({value: e.activePanel.scrollVal || 0}), p(e, !0)
    }

    function f(e) {
        var t = {x: this.x - e.stageX, y: this.y - e.stageY}, i = this.on("pressmove", function (e) {
            this.x = e.stageX + t.x, this.y = e.stageY + t.y
        }, this), s = this.on("pressup", function () {
            this.off("pressmove", i), this.off("pressup", s)
        }, this)
    }

    function w(e, t) {
        return e.name > t.name ? 1 : e.name < t.name ? -1 : 0
    }

    function v(e, t, i, s, a) {
        return (e - t) / (i - t) * (-s - a) + a
    }

    function b(e, t, i, s, a) {
        return (i - t) * (e - a) / (-s - a) + t
    }

    function y(e) {
        X.on("mousedown", a, e), Y.on("mousedown", o, e), k.on("mousedown", n, e), j.on("mousedown", r, e), M.on("mousedown", l, e), S.on("mousedown", u, e), T.on("mousedown", h, e), P.on("mousedown", c, e), F.on("change", i, e), C.on("change", t, e), z.on("mousedown", f, e)
    }

    function x(e, t, i, s) {
        var a, n, o, r, h, l;
        a = {x: 0, y: t / 2}, n = {x: t, y: 0}, o = {x: e - t, y: 0}, r = {x: e, y: t / 2}, h = {
            x: e - t,
            y: t
        }, l = {x: t, y: t};
        var c = new createjs.Shape;
        return c.graphics.s(i).ss(s).lt(a.x, a.y).lt(n.x, n.y).lt(o.x, o.y).lt(r.x, r.y).lt(h.x, h.y).lt(l.x, l.y).lt(a.x, a.y), c
    }

    createjs.extend(e, createjs.Container);
    var P, M, S, T, X, k, j, Y, C, L, F, R, z;
    e.prototype.slideIn = function () {
        new createjs.Tween(this).to({x: this.curX}, 750, createjs.Ease.quadOut)
    }, e.prototype.slideOut = function () {
        this.curX == this.x && (this.curX = this.x);
        new createjs.Tween(this).to({x: element.width + 10}, 750, createjs.Ease.quadIn)
    }, e.prototype.scroll = function (e, t, i) {
        this.activePanel.currentHeight + this.bounds.h > this.bounds.h ? this.activePanel.y = e : this.activePanel.y = 0, p(this, t, i)
    }, e.prototype.makePanel = function () {
        F = new Slider(.1, (this.bounds.w - this.y / 2) / (tileWidth + 60), this.bounds.w / 3, 15), R = x(F.width, F.height, "red", 1), C = new Slider(0, 100, .5 * this.bounds.h, 15), L = x(C.width, C.height, "red", 1), z = new createjs.Shape;
        var e;
        z.graphics.f("grey").append(this.bounds), z.alpha = .5, F.set({
            value: F.max / 3,
            mask: R
        }), F.x = this.y / 2, C.set({
            value: 0,
            regX: 15,
            regY: 15,
            rotation: 90,
            mask: L
        }), C.y = this.y / 2, L.set({regX: C.height, regY: C.height, rotation: 90}), L.y = C.y, R.x = F.x;
        for (var t in this.panels) e = this.panels[t], e.name = t, e.visible = !1, e.currentTilesPerRow = 0, e.currentHeight = 0, e.mask = z, e.scaleX = e.scaleY = F.value, e.tiles.sort(w), this.addChild(e), this.populate(e);
        this.activePanel.visible = !0, g(this, 5), this.addChild(X, k, j, Y, P, S, T, M, C, F, R, L), this.addChildAt(z, 0), y(this), this.x = element.width + 10, d(this)
    }, e.prototype.changePanel = function (e) {
        e = this.panels[e], m(this, e), this.slideIn()
    }, e.prototype.mouseWheel = function (e) {
        var t, i = 120 * -e.detail || e.wheelDelta, s = 100;
        i > 100 && (i = 100), -100 > i && (i = -100), t = C.value - i / s, t < C.min && (t = C.min), t > C.max && (t = C.max), C.set({value: t}), this.scroll(v(t, C.min, C.max, this.activePanel.currentHeight, 0), !0)
    }, e.prototype.addTile = function (e, t) {
        t.tiles.push(e), e.cursor = "pointer", e.on("mousedown", e.handleMouseDown), t.tiles.sort(w)
    }, e.prototype.removeTile = function (e, t) {
        var i = t.tiles.indexOf(e);
        i >= 0 && t.tiles.splice(i, 1)
    }, e.prototype.populate = function (e, t) {
        var i = 20, s = Math.floor(this.bounds.w / ((tileWidth + 3 * i) * e.scaleX));
        if (e.currentTilesPerRow != s || t) {
            e.removeAllChildren();
            for (var a, n, o = 0, r = 0, h = 0; h < e.tiles.length; h++) a = e.tiles[h], n = new createjs.Shape, n.graphics.beginStroke("lightgray").setStrokeStyle(5).drawRoundRect(i + r * (tileWidth + 3 * i), i + o * (tileHeight + 3 * i), tileWidth + 2 * i, tileHeight + 2 * i, i), a.x = 2 * i + r * (tileWidth + 3 * i) + tileWidth / 2, a.y = 2 * i + o * (tileHeight + 3 * i) + tileHeight / 2, a.parentPanel = e, e.addChild(n, a), r == s - 1 && o != e.tiles.length - 1 ? (r = 0, o++) : r++
        }
        e.currentTilesPerRow = s, e.currentHeight = (2 * i + (tileHeight + 3 * i) * Math.ceil(e.tiles.length / s)) * e.scaleX - this.bounds.h
    }, window.PanelContainer = createjs.promote(e, "Container")
}(), function () {
    function e(e, t, i, s) {
        this.Shape_constructor(), this.min = this.value = e || 0, this.max = t || 100, this.width = i || 100, this.height = s || 20, this.values = {}, this.trackColor = "#EEE", this.thumbColor = "#666", this.cursor = "pointer", this.on("mousedown", this._handleInput, this), this.on("pressmove", this._handleInput, this)
    }

    var t = createjs.extend(e, createjs.Shape);
    t.isVisible = function () {
        return !0
    }, t.draw = function (e, t) {
        if (this._checkChange()) {
            var i = (this.width - this.height) * Math.max(0, Math.min(1, (this.value - this.min) / (this.max - this.min)));
            this.graphics.clear().beginFill(this.trackColor).drawRect(0, 0, this.width, this.height).beginFill(this.thumbColor).drawRect(i, 0, this.height, this.height)
        }
        this.Shape_draw(e, !0)
    }, t._checkChange = function () {
        var e = this, t = e.values;
        return e.value !== t.value || e.min !== t.min || e.max !== t.max || e.width !== t.width || e.height !== t.height ? (t.min = e.min, t.max = e.max, t.value = e.value, t.width = e.width, t.height = e.height, !0) : !1
    }, t._handleInput = function (e) {
        var t = (e.localX - this.height / 2) / (this.width - this.height) * (this.max - this.min) + this.min;
        t = Math.max(this.min, Math.min(this.max, t)), t != this.value && (this.value = t, this.dispatchEvent("change"))
    }, window.Slider = createjs.promote(e, "Shape")
}();
