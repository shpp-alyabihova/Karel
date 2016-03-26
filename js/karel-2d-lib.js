var FPS = 30;

function Karel2DWorld() {
    this.animationMode = 0;
}

Karel2DWorld.prototype.initialize = function(jqueryObj){
    this.renderer = jqueryObj;
    this.speedCoeficient = 1;

    this.scale=1;
    this.cellSize=90;

    var _this = this;
    this.renderer.mousedown(function() {
        _this.renderer.draggable();
    });
};

Karel2DWorld.prototype.clear = function(){
    this.renderer.html("");
};

Karel2DWorld.prototype.resetKarelData = function () {
    this.karel = {};
    this.karel.x = this.karelStart.position[0];
    this.karel.y = this.karelStart.position[1];
    this.karel.direction = this.karelStart.direction;
};

Karel2DWorld.prototype.drawKarel = function () {
    if (this.$myKarel) {
        this.$myKarel.detach();
    }
    var karelClassName = "mykarel-" + this.findDirectionName();
    this.renderer.append("<div id='mykarel' class='"+karelClassName+"'></div>");
    this.$myKarel = $("#mykarel");

    var xy = this.defineRealPos(this.karel.x, this.karel.y);
    this.$myKarel.offset({left: xy[0], top: xy[1]});

    var height = this.$myKarel.height();
    this.$myKarel.height(height * this.scale);
    this.$myKarel.width(height * this.scale);

    //this.showKarelDirection();
};

Karel2DWorld.prototype.redrawMap = function () {
    this.renderer.html(this.createDomMap());

    if (this.scale != 1){
        var height = $(".cell").height();
        $(".cell").height(height * this.scale);
        $(".cell").width(height * this.scale);
        height =$(".beeper").height();
        $(".beeper").height(height * this.scale);
        $(".beeper").width(height * this.scale);
        var curFontSize= parseInt($(".beeper").css('font-size'));
        $(".beeper").css('font-size', curFontSize*this.scale);
    }
    this.drawKarel();
};

Karel2DWorld.prototype.loadMap = function(mapObj){
    this.map = JSON.parse(JSON.stringify(mapObj.map));
    this.karelStart = mapObj.karel;
    this.resetKarelData();

    this.scale = window.innerHeight / (this.map.length*this.cellSize) * 0.9;
    console.log("scale: ", this.scale);
    if (this.scale > 1) {
        this.scale = 1;
    }

    this.redrawMap();
};

Karel2DWorld.prototype.defineRealPos = function (x, y) {
    var id = "#y" + y + "x" + x;
    var realXY = $(id).offset();

    var res = [];
    res.push(realXY.left);
    res.push(realXY.top);

    return res;
};

Karel2DWorld.prototype.createDomMap = function() {
    var table = '<table id="map">';
    for (var row = 0; row < this.map.length; row++) {
        table = table + '<tr>';
        for (var cell = 0; cell < this.map[row].length; cell++) {
            var domCell = this.analyzeCell(row, cell, this.map[row][cell], this);
            table = table + "<td>" + domCell + "</td>"
        }
        table = table + "</tr>";
    }
    return table + "</table>";
};

Karel2DWorld.prototype.analyzeCell = function (y, x, cell){
    var id = "y" + y + "x" + x;
    if (cell == "x") {
        return '<div class="cell wall" id="' + id + '"></div>';
    }
    var retStr = '<div class="cell" id="'+id+'">';

    var numBeepers = parseInt(cell);
    if (numBeepers > 0) {
        retStr += '<div class="beeper">' + numBeepers + '</div>';
    }
    retStr += '</div>';
    return retStr;
};

Karel2DWorld.prototype.karelMove = function (duration, cb, cbArgs) {
    var _this=this;
    function defineNextKarelCell() {
        var res = [];
        res[0] = _this.karel.x; res[1] = _this.karel.y;
        if (_this.karel.direction == 1) { // right
            res[0]++;
        } else if (_this.karel.direction == 3) { // left
            res[0]--;
        } else if (_this.karel.direction == 0) { // down
            res[1]++;
        } else if (_this.karel.direction == 2) { // up
            res[1]--;
        }
        return res;
    }

    function animateKarelMove(curKarelPos, nextKarelPos) {
        _this.numTacts = duration/_this.speedCoeficient * FPS;

        console.log("move: ",duration, _this.speedCoeficient);

        var refreshInterval = 1000 / FPS;

        var dx = nextKarelPos[0] - curKarelPos[0];
        var dy = nextKarelPos[1] - curKarelPos[1];

        var tact = 0;

        var anymFunc = function() {
            if (_this.animationMode == 0) {
                tact++;
                //console.log("tact", tact);
                if (tact > _this.numTacts) {
                    _this.showKarelDirection();
                    if (cb) {
                        cb.apply(_this, cbArgs);
                    }
                    return;
                }
                _this.$myKarel.offset({
                    left: curKarelPos[0] + dx * tact / _this.numTacts,
                    top: curKarelPos[1] + dy * tact / _this.numTacts
                });
            }
            setTimeout (anymFunc, refreshInterval);
        };
        setTimeout (anymFunc, refreshInterval);
    }

    var curKarelPos = this.defineRealPos (this.karel.x, this.karel.y);

    var nextKarelCell = defineNextKarelCell();
    var nextKarelPos = this.defineRealPos (nextKarelCell[0], nextKarelCell[1]); // yx

    this.karel.x = nextKarelCell[0];
    this.karel.y = nextKarelCell[1];

    this.hideKarelDirection();
    animateKarelMove (curKarelPos, nextKarelPos);
};

Karel2DWorld.prototype.findDirectionName = function () {
    if (this.karel.direction == 0) {
        return "south";
    } else if (this.karel.direction == 1) {
        return "east";
    } else if (this.karel.direction == 2) {
        return "north";
    } else {
        return "west";
    }
};

Karel2DWorld.prototype.showKarelDirection = function () {
    //var dirClassName = "mydirection-" + this.findDirectionName();
    //if (this.$mykarelDirection != undefined) {
    //    try { this.$mykarelDirection.detach();
    //    } catch (e) {}
    //}
    //this.renderer.append("<div id='mykarelDirection' class='"+dirClassName+"'></div>");
    //this.$mykarelDirection = $("#mykarelDirection");
    //var xy = this.defineRealPos(this.karel.x, this.karel.y);
    //this.$mykarelDirection.offset({left: xy[0], top: xy[1]});
};

Karel2DWorld.prototype.hideKarelDirection = function () {
    //this.$mykarelDirection.detach();
};


Karel2DWorld.prototype.karelTurnRight = function (duration, cb, cbArgs){
    this.hideKarelDirection();
    this.karel.direction--;
    if (this.karel.direction<0) {
        this.karel.direction = 3;
    }
    var _this=this;

    console.log("right: ",duration, _this.speedCoeficient);

    setTimeout(function(){
        _this.drawKarel();
        _this.showKarelDirection();
        if (cb) {
            setTimeout(function(){
                cb.apply(_this, cbArgs);
            }, duration/_this.speedCoeficient/2*1000);
        }
    }, duration/_this.speedCoeficient/2*1000);
};

Karel2DWorld.prototype.karelTurnLeft = function (duration, cb, cbArgs) {
    this.hideKarelDirection();
    this.karel.direction++;
    if (this.karel.direction>3) {
        this.karel.direction = 0;
    }
    var _this=this;

    console.log("left: ",duration, _this.speedCoeficient);
    if (duration==undefined) {
        duration = 1;
    }
    setTimeout(function(){
        _this.drawKarel();
        _this.showKarelDirection();
        if (cb) {
            setTimeout(function(){
                cb.apply(_this, cbArgs);
            }, duration/_this.speedCoeficient/2*1000);
        }
    }, duration/_this.speedCoeficient/2*1000);
};

Karel2DWorld.prototype.karelPutBeeper = function (duration, cb, cbArgs){
    var beepersInCell = parseInt(this.map[this.karel.y][this.karel.x]);
    if (!beepersInCell){
        beepersInCell = 0;
    }
    beepersInCell++;
    this.map[this.karel.y][this.karel.x] = beepersInCell;

    var _this = this;
    setTimeout(function(){
        _this.redrawMap();
        if (cb) {
            setTimeout(function(){
                cb.apply(_this, cbArgs);
            }, duration/_this.speedCoeficient/2*1000);           
        }
    }, duration/_this.speedCoeficient/2*1000);

};

Karel2DWorld.prototype.karelTakeBeeper = function (duration, cb, cbArgs){
    var beepersInCell = parseInt(this.map[this.karel.y][this.karel.x]);
    if (!beepersInCell){
        beepersInCell = 0;
    }
    beepersInCell--;
    this.map[this.karel.y][this.karel.x] = beepersInCell;

    var duration = 0;
    var _this = this;
    setTimeout(function(){
        _this.redrawMap();
        if (cb) {
            setTimeout(function(){
                cb.apply(_this, cbArgs);
            }, duration/_this.speedCoeficient/2*1000);           
        }
    }, duration/_this.speedCoeficient/2*1000);

};

Karel2DWorld.prototype.setSpeed = function (speedCoeficient){
    this.speedCoeficient = speedCoeficient;
    console.log("speedCoeficient", speedCoeficient);
};

Karel2DWorld.prototype.stopWorld = function () {
    this.animationMode = 1;
};

Karel2DWorld.prototype.startWorld =function() {
    this.animationMode = 0;
};

Karel2DWorld.prototype.scaleUp =function() {
    this.scale += 0.1;
    this.redrawMap();
};

Karel2DWorld.prototype.scaleDown =function() {
    this.scale -= 0.1;
    this.redrawMap();
};

// var k2dw = new Karel2DWorld();
// var $map_field = $('#map-field');
// k2dw.initialize($map_field);

// var map =  {
//     name: 'some map name',
//     original: {
//         map:[
//             ['x', '', '', 3, '', 2, 3],
//             ['x', '', 4, 3, 'x', 1, ''],
//             ['', '', 'x', 1, 'x', '', ''],
//             ['', 'x', 3, 'x', 2, '', 5],
//             ['', 'x', '', 1, 'x', 'x', ''],
//             [2,  '',   1, 3, 'x', 'x', ''],
//             ['x', '', 'x', 3, '', 1, '']
//         ],
//         karel: {
//             position: [0, 5],
//             direction: 1,
//             beepers: 1000
//         }
//     },
//     final:  [{
//         map:[
//             ['x', '', '', 3, '', 2, 3],
//             ['x', '', 4, 3, 'x', 1, ''],
//             ['', '', 'x', 1, 'x', '', ''],
//             ['', 'x', 1, 'x', 2, '', 5],
//             ['', 'x', 1, 1, 'x', 'x', ''],
//             [1, 1, 1, 1, 'x', 'x', ''],
//             ['x', '', 'x', 3, '', 1, '']
//         ],
//         karel: {
//             position: [0, 5],
//             direction: 1
//         }
//     }],
//     description: 'problem solving'
// };

// k2dw.loadMap(map.original);
// k2dw.karelMove(2, function(){
//     k2dw.karelPutBeeper(2, function(){
//         k2dw.karelTurnLeft(2, function(){
//             k2dw.karelMove(2, function(){
//                 console.log("finished");
//             });
//         });
//     });
// });

// document.onkeydown = checkKey;

// function checkKey(e) {
//     e = e || window.event;
//     if (e.keyCode == '38') { // up arrow
//         console.log("+");
//         k2dw.scaleUp();
//     }
//     else if (e.keyCode == '40') { // down arrow
//         console.log("-");
//         k2dw.scaleDown();
//     }
// }
