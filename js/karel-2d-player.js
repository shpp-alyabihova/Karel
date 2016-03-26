/**
 * Created by Uzer on 19.01.2016.
 */
var KarelObj=function(){
    this.x=0; this.y=0; this.dir=0; this.beepers=1000;
    this.move=function(){
        if(this.dir%2==0)
            this.y-=(this.dir-1);
        else
            this.x-=(this.dir-2);
    };
    this.turnLeft=function(){
        this.dir++; if(this.dir==4) this.dir=0;
    };
};

function Karel2dPlayer(elem, map) {
    this.element = elem.eq(0);
    this.map = JSON.parse(JSON.stringify(map.map));
    this.myKarel=new KarelObj();

    this.sourceKarel=new KarelObj();
    this.fillKarelDataFromMap(this.myKarel,map);
    this.sourceMap = JSON.parse(JSON.stringify(map.map)); //map.map.slice(0);
    this.fillKarelDataFromMap(this.sourceKarel,map);

    this.beepersSpritesInCells=[];
    this.karelSpriteMovingTime=1000;

    this.canvasFontSize="11px";
    this.arSprites=[];

    this.spriteCellSize=66;
    this.spriteBeeperSize=34; //17;
    this.scaleFactor=1;
    this.realCellSize=this.scaleFactor*this.spriteCellSize;
    this.karelOffset=3;
    this.mapStartX=0; this.mapStartY=0;
    this.defineStartXYforMap();
    this.init();
}
Karel2dPlayer.prototype.fillKarelDataFromMap=function (_karel, map) {
    _karel.x=map.karel.position[0];
    _karel.y=map.karel.position[1];
    _karel.dir=map.karel.direction;
    _karel.beepers=map.karel.beepers;
};
Karel2dPlayer.prototype.init = function () {
    var obj=this;
    var line=[];
    for(var i=0;i<this.map[0].length;i++)
        line.push("");
    for(i=0;i<this.map.length;i++){
        var nline=line.slice();
        this.beepersSpritesInCells.push(nline);
    }
    var phLoaded=function(){
        console.log("phaser loaded");
        obj.phaserInit();
    };
    if($("canvas").css("font-size")==this.canvasFontSize){ // already loaded
        obj.phaserInit();
    } else {
        var s = document.createElement('script');
        s.type='text/javascript';
        s.onload=phLoaded;
        s.src='vendor/js/phaser.min.js';
        document.body.appendChild(s);
    }
};

Karel2dPlayer.prototype.fillArMovies=function(commands) {
    var myKarel=this.myKarel;
    var startX=myKarel.x, startY=myKarel.y, startDir=myKarel.dir, startBeepers=myKarel.beepers;
    var currentMap=this.map;
    //var incomingMap=JSON.parse(JSON.stringify(currentMap));
    var arM=[];

    for(var i=0; i<commands.length;i++){

        var oldX=myKarel.x, oldY=myKarel.y, oldDir=myKarel.dir, oldBeepers=parseInt(currentMap[myKarel.y][myKarel.x]);

        var cmd=commands[i].command;
        var _angle="";

        if(cmd=="move") myKarel.move();
        else if(cmd=="rotate"){
            _angle=commands[i].data.angle
            if(_angle==-1)
                myKarel.turnLeft();
            else {
                myKarel.turnLeft();myKarel.turnLeft();myKarel.turnLeft();
            }
        }
        else if(cmd=="pick"){
            currentMap[oldY][oldX]=parseInt(currentMap[oldY][oldX])-1;
        }
        else if(cmd=="put"){
            if(currentMap[oldY][oldX]=="")
                var curBeepersNum=0;
            else
                var curBeepersNum=parseInt(currentMap[oldY][oldX]);
            currentMap[oldY][oldX]=(curBeepersNum+1);
        }

        var newX=myKarel.x, newY=myKarel.y, newDir=myKarel.dir,
            newBeepers=parseInt(currentMap[myKarel.y][myKarel.x]);

        arM.push(
            {oldData:{x:oldX, y:oldY, dir:oldDir, beepers: oldBeepers},
                newData:{x:newX, y:newY, dir:newDir, beepers: newBeepers},
                command: cmd,
                angle: _angle}
        );
    }
    myKarel.x=startX; myKarel.y=startY; myKarel.dir=startDir; myKarel.beepers=startBeepers;
    return arM;
};
Karel2dPlayer.prototype.pause=function(){
    console.log("incoming pause");
    this.onPause=true;
}
Karel2dPlayer.prototype.resume=function(){
    console.log("incoming resume");
    if(this.onPause){
        this.onPause=false;
        this.goKarel();
    }
};

Karel2dPlayer.prototype.drawMap=function () {
    var map=this.map;
    for(var x=0; x<map[0].length; x++){
        for(var y=0; y<map.length; y++){
            if(map[y][x]=="x")
                this.addWallCell(x,y);
            else {
                this.addEmptyCell(x,y);
                if(!isNaN(parseInt(map[y][x]))){
                    this.addBeepersToCell(x,y,parseInt(map[y][x]));
                }
            }
        }
    }
};
Karel2dPlayer.prototype.redrawBeepers=function () {
    var bm=this.beepersSpritesInCells;
    for(var x=0; x<bm[0].length; x++){
        for(var y=0; y<bm.length; y++){
            for(var i=0;i<bm[y][x].length;i++){
                var bs=bm[y][x].shift();
                bs.destroy(true);
            }
        }
    }
    var map=this.map;
    for(x=0; x<map[0].length; x++){
        for(y=0; y<map.length; y++){
            if(map[y][x]!="x") {
                if(!isNaN(parseInt(map[y][x]))){
                    this.addBeepersToCell(x,y,parseInt(map[y][x]));
                }
            }
        }
    }
};

Karel2dPlayer.prototype.addEmptyCell=function (x,y){
    var obj=this;
    var realX=obj.mapStartX+x*obj.spriteCellSize*obj.scaleFactor,
        realY=obj.mapStartY+y*obj.spriteCellSize*obj.scaleFactor;
    var spr=obj.game.add.sprite(realX, realY, 'empty');
    obj.arSprites.push(spr);
    //spr.frame = 33; // road
    var cellSpriteScaleFactor=obj.spriteCellSize/spr.height;
    spr.scale.setTo(obj.scaleFactor*cellSpriteScaleFactor,obj.scaleFactor*cellSpriteScaleFactor);
};
Karel2dPlayer.prototype.addWallCell=function (x,y){
    var obj=this;
    var realX=obj.mapStartX+x*obj.spriteCellSize*obj.scaleFactor,
        realY=obj.mapStartY+y*obj.spriteCellSize*obj.scaleFactor;
    var spr=obj.game.add.sprite(realX, realY, 'wall');
    obj.arSprites.push(spr);
    //spr.frame = 9; // wall
    var cellSpriteScaleFactor=obj.spriteCellSize/spr.height;
    spr.scale.setTo(obj.scaleFactor*cellSpriteScaleFactor,obj.scaleFactor*cellSpriteScaleFactor);
};
Karel2dPlayer.prototype.addBeepersToCell=function (x,y, num){
    var obj=this;
    var arBeepersPerCell=[];
    function putBeeperWithCenterAt(x, y) {
        var spr=obj.game.add.sprite(x, y, 'beeper');
        spr.anchor.setTo(0.5, 0.5);

        var beeperScaleFactor=obj.spriteCellSize/(4*spr.height)*obj.scaleFactor*0.9;
        //var sprSize=spr.height*beeperScaleFactor;
        //spr.x=x+sprSize/2; spr.y=y+sprSize/2;
        obj.arSprites.push(spr);
        spr.scale.setTo(beeperScaleFactor,beeperScaleFactor);
        arBeepersPerCell.push(spr);
    }
    var realX=obj.mapStartX+x*obj.spriteCellSize*obj.scaleFactor,
        realY=obj.mapStartY+y*obj.spriteCellSize*obj.scaleFactor;
    var cellSize=obj.spriteCellSize*obj.scaleFactor;
    var xCenter=realX+cellSize/2;
    var yCenter=realY+cellSize/2;

    function putBeepersLine(number, lineY) {
        if(number==2){
            putBeeperWithCenterAt(realX+cellSize/4, lineY);
            putBeeperWithCenterAt(realX+cellSize*3/4, lineY);
        } else {
            putBeeperWithCenterAt(realX+cellSize/4, lineY);
            putBeeperWithCenterAt(xCenter, lineY);
            putBeeperWithCenterAt(realX+cellSize*3/4, lineY);
        }
    }

    if(num==1) {
        putBeeperWithCenterAt(xCenter, yCenter);
    } else if(num==2){
        putBeepersLine(2,yCenter);
    } else  if(num==3){
        putBeeperWithCenterAt(realX+cellSize/4, realY+cellSize/4);
        putBeeperWithCenterAt(xCenter, yCenter);
        putBeeperWithCenterAt(realX+cellSize*3/4, realY+cellSize*3/4);
    } else  if(num==4){
        putBeepersLine(2,realY+cellSize/4);
        putBeepersLine(2,realY+cellSize*3/4);
    } else  if(num==5){
        putBeepersLine(2,realY+cellSize/4);
        putBeeperWithCenterAt(xCenter, yCenter);
        putBeepersLine(2,realY+cellSize*3/4);
    } else  if(num==6){
        putBeepersLine(3,realY+cellSize/4);
        putBeepersLine(3,realY+cellSize*3/4);
    } else  if(num==7){
        putBeepersLine(3,realY+cellSize/4);
        putBeeperWithCenterAt(xCenter, yCenter);
        putBeepersLine(3,realY+cellSize*3/4);
    } else  if(num==8){
        putBeepersLine(3,realY+cellSize/4);
        putBeepersLine(2,yCenter);
        putBeepersLine(3,realY+cellSize*3/4);
    } else {
        putBeepersLine(3,realY+cellSize/4);
        putBeepersLine(3,yCenter);
        putBeepersLine(3,realY+cellSize*3/4);
    }
    obj.beepersSpritesInCells[y][x]=arBeepersPerCell;
};

Karel2dPlayer.prototype.phaserInit = function () {
    var obj=this;
    var preload=function() {
        //obj.game.load.spritesheet('presets', 'img/tmw_desert_spacing.png',obj.spriteCellSize,obj.spriteCellSize);
        obj.game.load.image('wall', 'img/2d_wall.jpg');
        obj.game.load.image('empty', 'img/2d_grass.jpg');
        obj.game.load.image('beeper', 'img/beeper_new.png');
        obj.game.load.image('karel', 'img/new_rob_1.png');
        obj.game.load.image('karelFlipped', 'img/new_rob_3.png');
        obj.game.load.image("background", "img/fioletovyj-fon19.jpg");
        //obj.game.load.image('btn_pause','img/btn_pause.png');
        //obj.game.load.image('btn_play','img/btn_play.png');
        //obj.game.load.image('btn_replay','img/btn_replay.png');
        //obj.game.load.audio('boden', 'js/testing/square.mp3');
    };
    function onPauseBtn(){
        console.log("pause pressed");
        obj.onPause=true;
    }
    function onPlayBtn(){
        console.log("play pressed");
        obj.onPause=false;
        obj.goKarel();
    }
    function onReplayBtn(){
        console.log("Replay pressed");
        obj.myKarel.x=obj.sourceKarel.x;
        obj.myKarel.y=obj.sourceKarel.y;
        obj.myKarel.dir=obj.sourceKarel.dir;
        obj.karelSprite.destroy(true);
        obj.karelSprite=obj.createKarelSprite();
        obj.karelSpriteSetup();
        obj.map=obj.sourceMap.slice(0);
        if(obj.bounceOnScreen!=undefined){
            obj.bounceOnScreen.stop();
            obj.textOnScreen.destroy(true)
            obj.bounceOnScreen=undefined;
        }
        obj.play();
    }
    var create=function () {
        //function drawButtons() {
        //    var fieldCenterX=obj.map[0].length*obj.spriteCellSize*obj.scaleFactor/2;
        //    var fieldMaxY=obj.map.length*obj.spriteCellSize*obj.scaleFactor;
        //    var btnOffset=30;
        //    //obj.btnPause = obj.game.add.button(20, fieldMaxY+btnOffset, 'btn_pause', onPauseBtn, this);
        //    //obj.btnPlay = obj.game.add.button(110, fieldMaxY+btnOffset, 'btn_play', onPlayBtn, this);
        //    //obj.btnReplay = obj.game.add.button(200, fieldMaxY+btnOffset, 'btn_replay', onReplayBtn, this);
        //}
        //this.game.stage.backgroundColor = "#4488AA";
        var background = obj.game.add.tileSprite(0, 0, obj.element.width(), obj.element.height(), "background");

        obj.drawMap();
        //drawButtons();
        obj.karelSprite=obj.createKarelSprite();
        obj.karelSpriteSetup();

        var canv=$("canvas");
        canv.css("font-size",obj.canvasFontSize);

        //obj.music = obj.game.add.audio('boden');
        //obj.game.sound.setDecodedCallback([obj.music], start, this);
    };

    function putBeeperSprite(x,y,num) {
        var arSpritesInCurrentCell=obj.beepersSpritesInCells[y][x];
        for(var i=0;i<arSpritesInCurrentCell.length;i++){
            arSpritesInCurrentCell[i].destroy(true);
        }
        if(obj.beepersSpritesInCells[y][x].length>0)
            obj.beepersSpritesInCells[y][x].splice(0,obj.beepersSpritesInCells[y][x].length);
        obj.addBeepersToCell(x,y,num);
        obj.game.world.bringToTop(obj.karelSprite);
        var f=function(){
            obj.goKarel();
        };
        setTimeout(f,obj.karelSpriteMovingTime);
    }

    function pickUpBeeperSprite(x,y) {
        try{
            var bs=obj.beepersSpritesInCells[y][x].shift();
            var bounce=obj.game.add.tween(bs.scale);
            bounce.to( { x: 0, y: 0 }, obj.karelSpriteMovingTime, Phaser.Easing.Linear.None, false);
            bounce.onComplete.add(function(){
                bounce.stop();
                bs.destroy(true);
                console.log("pickupping stopped");
                obj.goKarel();
            });
            bounce.start();
        } catch (e){
            console.log("error on pickuping",e);
            obj.goKarel();
        }
    }

    function moveKarelSprite() {
        var dx=0, dy=0;
        if(obj.myKarel.dir%2==0)
            dy=(1-obj.myKarel.dir)*obj.realCellSize;
        else
            dx=(2-obj.myKarel.dir)*obj.realCellSize;
        console.log("moving: angle ="+obj.karelSprite.angle+" dir="+obj.myKarel.dir+" dx="+dx+" dy="+dy);
        var bounce=obj.game.add.tween(obj.karelSprite);
        bounce.to( {x: obj.karelSprite.x+dx, y: obj.karelSprite.y+dy}, obj.karelSpriteMovingTime,
            Phaser.Easing.Linear.InOut,obj.karelSpriteMovingTime*2);
        bounce.onComplete.add(function(){
            bounce.stop();
            console.log("moving stopped");
            obj.goKarel();
        }, this);
        bounce.start();
    }
    function writeFinalTextSprite(msg, color) {
        //var fieldCenterX=obj.map[0].length*obj.spriteCellSize*obj.scaleFactor/2;
        //var fieldCenterY=obj.map.length*obj.spriteCellSize*obj.scaleFactor/2;
        //var text = obj.game.add.text(fieldCenterX, fieldCenterY, msg);
        //text.anchor.set(0.5);
        //text.align = 'center';
        //text.font = 'Arial';
        //text.fontWeight = 'bold';
        //text.fontSize = 70;
        //text.fill = color;
        //var bounce=obj.game.add.tween(text.scale);
        //bounce.to( { x: (obj.karelScaleFactor*1.3), y: (obj.karelScaleFactor*1.3) }, obj.karelSpriteMovingTime/2,
        //    Phaser.Easing.Linear.None, true,0,-1,true);
        //var f=function(){
        obj.allFinished();
        obj.onPlayerFinish();
        //};
        //setTimeout(f,obj.karelSpriteMovingTime*3);
        //obj.bounceOnScreen=bounce;
        //obj.textOnScreen=text;
    }

    var update= function () {
        function drawComand(currentCommand) {
            if(obj.lastTextObj!=undefined)
                obj.lastTextObj.destroy(true);
            var fieldCenterX=obj.mapStartX+obj.map[0].length*obj.spriteCellSize*obj.scaleFactor/2;
            var fieldMaxY=obj.mapStartY+obj.map.length*obj.spriteCellSize*obj.scaleFactor;
            var text = obj.game.add.text(fieldCenterX, fieldMaxY+obj.karelOffset, currentCommand);
            text.anchor.set(0.5,0);
            text.align = 'center';
            text.font = 'Arial';
            text.fontWeight = 'bold';
            text.fontSize = 20;
            text.fill = 'white';
            obj.lastTextObj=text;
        }

        if(obj.currentCommand!="")
            drawComand(obj.currentCommand);
        if(obj.currentCommand=="move"){
            obj.currentCommand="";
            moveKarelSprite()
        } else if(obj.currentCommand=="rotate"){
            obj.currentCommand="";
            obj.rotateKarelSprite();
        } else if(obj.currentCommand=="pick"){
            obj.currentCommand="";
            pickUpBeeperSprite(obj.myKarel.x,obj.myKarel.y);
        } else if(obj.currentCommand=="put"){
            obj.currentCommand="";
            var totalBeepersInCell=obj.currentBeepersInCell;
            putBeeperSprite(obj.myKarel.x,obj.myKarel.y,totalBeepersInCell);
        } else if(obj.currentCommand=="finish"){
            obj.currentCommand="";
            writeFinalTextSprite("you pass!", "red");
        } else if(obj.currentCommand=="crash"){
            obj.currentCommand="";
            writeFinalTextSprite("YOU CRASHED!", "black");
        } else if(obj.currentCommand=="error"){
            obj.currentCommand="";
            writeFinalTextSprite("error...", "yellow");
        }
    };

    var divForPhaser=this.element[0];

    try{
        $("canvas").remove();
        //game.world.removeAll();
    } catch (e) {}

    this.game = new Phaser.Game(this.element.width(), this.element.height(), Phaser.CANVAS, divForPhaser, { preload: preload, create: create, update: update});
};

Karel2dPlayer.prototype.rotateKarelSprite=function (param) {
    var obj=this;
    var bounce=obj.game.add.tween(obj.karelSprite);
    bounce.to({angle: obj.karelSprite.angle+90*obj.currentAngleRotation}, obj.karelSpriteMovingTime, Phaser.Easing.Linear.InOut,false);
    bounce.onComplete.add(function(){
        bounce.stop();
        console.log("rotating stopped");
        if(((obj.karelSprite.angle==0)||(Math.abs(obj.karelSprite.angle)==180))&&((obj.lastKarelDir!=obj.myKarel.dir)))
            obj.flipKarelSprite(param);
        else{
            if(param==undefined)
                obj.goKarel();
        }
    });
    bounce.start();
};

Karel2dPlayer.prototype.flipKarelSprite=function (param) {
    var obj=this;
    var bounce=obj.game.add.tween(obj.karelSprite.scale);
    bounce.to( { y: 0  }, obj.karelSpriteMovingTime/2, Phaser.Easing.Linear.None, false);
    bounce.onComplete.add(function(){
        bounce.stop();
        obj.karelSprite.destroy(true);
        console.log("karel flip 1/2 stopped");

        obj.karelSprite=obj.createKarelSprite(obj.myKarel.x,obj.myKarel.y);
        obj.karelSprite.scale.setTo(obj.karelScaleFactor);

        var bounce2=obj.game.add.tween(obj.karelSprite.scale);
        bounce2.from( { y: 0  }, obj.karelSpriteMovingTime/2, Phaser.Easing.Linear.None, false);
        bounce2.onComplete.add(function(){
            bounce2.stop();
            obj.karelDancing();
            if(param==undefined)
                obj.goKarel();
        });
        bounce2.start();
    });
    bounce.start();
};

Karel2dPlayer.prototype.karelSpriteSetup=function (){
    var obj=this;
    obj.karelDancingBounce=obj.karelDancing(1);
    obj.karelDancingBounce.pause();

    if(obj.myKarel.dir==0){
        obj.currentAngleRotation=1;
        obj.rotateKarelSprite("start");
    } else if(obj.myKarel.dir==2){
        obj.currentAngleRotation=-1;
        obj.rotateKarelSprite("start");
    }
};

Karel2dPlayer.prototype.createKarelSprite=function (){
    var obj=this;
    var x=obj.myKarel.x, y=obj.myKarel.y;
    var realX=obj.mapStartX+x*obj.spriteCellSize*obj.scaleFactor+obj.karelOffset,
        realY=obj.mapStartY+y*obj.spriteCellSize*obj.scaleFactor+obj.karelOffset;

    if (obj.myKarel.dir==3)
        var spr=obj.game.add.sprite(realX, realY, 'karelFlipped');
    else
        var spr=obj.game.add.sprite(realX, realY, 'karel');
    obj.arSprites.push(spr);
    obj.lastKarelDir=obj.myKarel.dir;

    var sc=obj.spriteCellSize*obj.scaleFactor/spr.height;
    obj.karelScaleFactor=sc;
    spr.scale.setTo(sc,sc);
    spr.anchor.setTo(0.5, 0.5);
    spr.x=spr.x+spr.width/2;
    spr.y=spr.y+spr.height/2;
    return spr;
}

Karel2dPlayer.prototype.karelDancing=function (){
    var obj=this;
    var bounce=obj.game.add.tween(obj.karelSprite.scale);
    var karelDancingScaleFactor=1.05;
    bounce.to( { x: (obj.karelScaleFactor*karelDancingScaleFactor), y: (obj.karelScaleFactor*karelDancingScaleFactor) }, obj.karelSpriteMovingTime/4,
        Phaser.Easing.Linear.None, true,0,-1,true);
    return bounce;
}

Karel2dPlayer.prototype.play = function (incomingCommands,onPlayerFinish) {
    if(incomingCommands==undefined){ // internal call
        incomingCommands=this.incomingCommands;
        onPlayerFinish=this.onPlayerFinish;
    } else { // if external command "play" again
        if((this.myKarel.x!=this.sourceKarel.x)||(this.myKarel.y!=this.sourceKarel.y)||(this.myKarel.dir!=this.sourceKarel.dir)
            ||(this.myKarel.beepers!=this.sourceKarel.beepers)) {
            this.myKarel.x=this.sourceKarel.x;
            this.myKarel.y=this.sourceKarel.y;
            this.myKarel.dir=this.sourceKarel.dir;
            this.myKarel.beepers=this.sourceKarel.beepers;
            this.map=JSON.parse(JSON.stringify(this.sourceMap));
            this.redrawBeepers();
            this.karelSprite.destroy(true);
            this.karelSprite=this.createKarelSprite();
            this.karelSpriteSetup();
        }
        if(this.bounceOnScreen!=undefined){
            this.bounceOnScreen.stop();
            //this.textOnScreen.destroy(true)
            this.bounceOnScreen=undefined;
        }
        //if(this.textOnScreen!=undefined){
        //    this.textOnScreen.destroy(true);
        //}
        if(this.arMoves&&this.arMoves.length>0){
            this.terminated=true;
            this.arMoves.splice(0,this.arMoves.length);
        }
    }
    this.onPause=false;
    this.arMoves=this.fillArMovies(incomingCommands);
    this.incomingCommands=incomingCommands.slice();
    this.onPlayerFinish=onPlayerFinish;

    this.game.lockRender = false;
    this.game.paused = false;
    this.game.stage.disableVisibilityChange = false;

    this.karelDancingBounce.resume();

    //this.music.volume=0.5;
    //this.music.play();

    this.goKarel();
};

Karel2dPlayer.prototype.goKarel=function(){
    if(this.terminated){
        this.terminated=false;
        return;
    }
    if(this.arMoves.length==0){
        this.allFinished();
        return;
    }
    if(this.onPause)
        return;
    var data=this.arMoves.shift();

    if(data.command=="move"){
        this.myKarel.x=data.newData.x; this.myKarel.y=data.newData.y;
    } else if (data.command=="rotate"){
        this.currentAngleRotation=data.angle;
        this.myKarel.dir=data.newData.dir;
    } else if (data.command=="pickup"){
        this.myKarel.beepers++;
    } else if (data.command=="put"){
        this.myKarel.beepers--;
        this.currentBeepersInCell=data.newData.beepers;
    }
    this.currentCommand=data.command;

};

Karel2dPlayer.prototype.allFinished=function(){
    console.log("all finished");
    this.arMoves=false;
    this.karelDancingBounce.pause();
    //this.music.stop();
};

Karel2dPlayer.prototype.setMap = function(map) {

    this.map = JSON.parse(JSON.stringify(map.map));
    this.sourceMap = JSON.parse(JSON.stringify(map.map));

    this.fillKarelDataFromMap(this.sourceKarel,map);

    this.myKarel=new KarelObj();
    this.sourceKarel=new KarelObj();

    this.fillKarelDataFromMap(this.myKarel,map);
    this.fillKarelDataFromMap(this.sourceKarel,map);

    for(var i=0; i<this.arSprites.length;i++)
        this.arSprites[i].destroy(true);
    this.arSprites.splice(0,this.arSprites.length);

    this.defineStartXYforMap();
    this.drawMap();
    this.karelSprite=this.createKarelSprite();
    this.karelSpriteSetup();

};

Karel2dPlayer.prototype.destroy=function(){
    this.game.world.destroy();
};

Karel2dPlayer.prototype.defineStartXYforMap = function () {
    var mapWidth=this.map[0].length*this.spriteCellSize*this.scaleFactor;
    var mapHeight=this.map.length*this.spriteCellSize*this.scaleFactor;
    this.mapStartX=this.element.width()/2-mapWidth/2;
    this.mapStartY=this.element.height()/2-mapHeight/2;
};
