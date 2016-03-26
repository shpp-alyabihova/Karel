function Cell(){
    this.blocked=false;
    this.beepers=0;
    this.isKarel=false;
    this.cellSprite=undefined;
    this.cellBeepersSprites=[];
}

function KarelMapEditor(elem) {
    function initMap(map,x,y) {
        for(var j=0;j<y;j++){
            var line=[];
            for(var i=0;i<x;i++){
                var cell=new Cell;
                line.push(cell);
            }
            var nline=line.slice(0);
            map.push(nline);
        }
    }

    this.element = elem.eq(0);

    this.mapWidth=6;
    this.mapHeight=4;

    this.maps={
        startMap:[],
        finalMap:[]
    };

    initMap(this.maps.startMap,this.mapWidth,this.mapHeight);
    initMap(this.maps.finalMap,this.mapWidth,this.mapHeight);
    this.currentMap=this.maps.startMap;
    this.currentMapName="START";

    this.mapOffsetX=10;
    this.mapOffsetY=50;
    this.rightMenuSize=100;
    this.mapArea={};
    this.karelStartDir=1;
    this.karelFinalDir=1;
    this.karelStartFlipped=false;
    this.karelFinalFlipped=false;
    this.finalMapEdited=false;
    this.canvasFontSize="11px";

    this.spriteCellSize=66;
    this.spriteBeeperSize=34;
    this.scaleFactor=1;
    this.realCellSize=this.scaleFactor*this.spriteCellSize;

    this.addPhaser();

}

KarelMapEditor.prototype.addPhaser = function () {
    var obj=this;
    phLoaded=function(){
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
KarelMapEditor.prototype.phaserInit = function () {
    var obj=this;

    var preload=function() {
        obj.game.load.image('wall', 'img/2d_wall.jpg');
        obj.game.load.image('empty', 'img/2d_grass.jpg');
        obj.game.load.image('beeper', 'img/beeper_new.png');
        obj.game.load.image('karel', 'img/new_rob_1.png');
        obj.game.load.image('karelFlipped', 'img/new_rob_3.png');
        obj.game.load.image("background", "img/fioletovyj-fon19.jpg");
    };

    function addBeepersToCell(x,y, num){
        var arBeepersPerCell=[];
        function putBeeperWithCenterAt(x, y) {
            var beeperScaleFactor=obj.scaleFactor*0.75;
            if(num>1&&num<3)beeperScaleFactor=beeperScaleFactor*0.7;
            if(num>=3)beeperScaleFactor=beeperScaleFactor*0.5;
            var bSize=obj.spriteBeeperSize*beeperScaleFactor;
            var realX=x-bSize/2, realY=y-bSize/2;
            arBeepersPerCell.push(obj.createBeeperSprite(realX,realY,beeperScaleFactor));
        }
        var realX=x*obj.spriteCellSize*obj.scaleFactor,realY=y*obj.spriteCellSize*obj.scaleFactor;
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
    }

    var create=function () {
        function drawRightMenu() {
            var startX=obj.game._width-obj.rightMenuSize;

            function addTextAtCenter(y,_text, size, color) {
                var x=startX+obj.rightMenuSize/2;
                var style = { font: ""+size+"px Verdana", fill: "#fff", align: "center" };
                var text = obj.game.add.text(x, y, _text, style);
                text.anchor.set(0.5,0);
                //text.align = 'center';
                //text.font = 'Arial';
                //text.fontWeight = 'bold';
                //text.fontSize = size;
                //text.fill = color;
            }
            //function onPlusMapWidthBtn() {
            //    obj.incrMapWidth();
            //}
            //function onMinusMapWidthBtn() {
            //    obj.decrMapWidth();
            //}
            //function onPlusMapHeightBtn() {
            //    obj.incrMapHeight();
            //}
            //function onMinusMapHeightBtn() {
            //    obj.decrMapHeight();
            //}

            function createDropPropertiesForCellSprite(elem,isWall) {
                function onDragStop(sprite, pointer) {
                    function replaceSpriteOnMap(mapXY, sprite) {
                        obj.currentMap[mapXY.y][mapXY.x].cellSprite.destroy(true);
                        sprite.x=obj.findRealX(mapXY.x);
                        sprite.y=obj.findRealY(mapXY.y);
                        sprite.name+="x"+mapXY.x+"y"+mapXY.y;
                        sprite.inputEnable=false;
                        sprite.input.draggable = false;
                        obj.game.world.sendToBack(sprite);
                        obj.currentMap[mapXY.y][mapXY.x].cellSprite=sprite;
                    }
                    function createNewRMenuSprite(name) {
                        if(name=="wall"){
                            obj.sprRMenuWall=obj.createCellSprite(obj.sprRMenuWallX, obj.sprRMenuWallY, name, "top");
                            createDropPropertiesForCellSprite(obj.sprRMenuWall,true);
                        } else {
                            obj.sprRMenuEmpty=obj.createCellSprite(obj.sprRMenuEmptyX, obj.sprRMenuEmptyY, name, "top");
                            createDropPropertiesForCellSprite(obj.sprRMenuEmpty,false);
                        }
                    }

                    console.log("Stop dragging elem",elem);
                    if(!obj.droppedOnMap(pointer.x,pointer.y))
                        return;
                    var mapXY=obj.findMapXY(pointer.x,pointer.y);

                    replaceSpriteOnMap(mapXY,sprite);
                    if(isWall){
                        createNewRMenuSprite("wall");
                        obj.currentMap[mapXY.y][mapXY.x].blocked=true;
                    } else {
                        createNewRMenuSprite("empty");
                        obj.currentMap[mapXY.y][mapXY.x].blocked=false;
                    }
                }
                if(isWall){
                    obj.sprRMenuWallX=elem.x;
                    obj.sprRMenuWallY=elem.y;
                    elem.name="wall";
                } else {
                    obj.sprRMenuEmptyX=elem.x;
                    obj.sprRMenuEmptyY=elem.y;
                    elem.name="empty";
                }
                elem.inputEnabled = true;
                elem.input.enableDrag();
                elem.events.onDragStop.add(onDragStop, this);
            }

            //function onBtnStartMap() {
            //    obj.startMap();
            //}
            //function onBtnFinalMap() {
            //    obj.finalMap();
            //}
            //function onQuitBtn() {
            //    console.log("quit required")
            //}

            var graphics = obj.game.add.graphics(0, 0);

            graphics.lineStyle(2, 0x8470FF, 1);
            graphics.beginFill(0x8470FF, 1);
            graphics.drawRect(startX, 0, obj.rightMenuSize-1, window.innerHeight-1);
            graphics.endFill();

            var curY=20, offsetX=20, offsetY=30;

            //addTextAtCenter(5,"Main menu", 24, "red");
            //addTextAtCenter(40,"Map size", 20, "yellow");

            //addTextAtCenter(curY+3,"width", 20, "#ff00ff");
            //obj.game.add.button(startX+offsetX, curY, 'btn_plus', onPlusMapWidthBtn, this);
            //obj.game.add.button(startX+obj.rightMenuSize-50, curY, 'btn_minus', onMinusMapWidthBtn, this);
            //
            //curY+=40;
            //addTextAtCenter(curY+3,"height", 20, "#ff00ff");
            //obj.game.add.button(startX+offsetX, curY, 'btn_plus', onPlusMapHeightBtn, this);
            //obj.game.add.button(startX+obj.rightMenuSize-50, curY, 'btn_minus', onMinusMapHeightBtn, this);
            //curY+=40;

            addTextAtCenter(curY+3,"Elements", 20, "yellow");
            curY+=40;
            obj.sprRMenuWall=obj.createCellSprite(startX+offsetX, curY, "wall", "top");
            createDropPropertiesForCellSprite(obj.sprRMenuWall,true);

            curY+=obj.spriteCellSize*obj.scaleFactor+offsetY;
            obj.sprRMenuEmpty=obj.createCellSprite(startX+offsetX, curY, "empty", "top");
            createDropPropertiesForCellSprite(obj.sprRMenuEmpty,false);

            curY+=obj.spriteCellSize*obj.scaleFactor+offsetY;
            obj.sprRMenuBeeper=obj.createBeeperSprite(startX+offsetX+10, curY,3);
            obj.sprRMenuBeeperX=obj.sprRMenuBeeper.x; obj.sprRMenuBeeperY=obj.sprRMenuBeeper.y;
            obj.createDropBeeperProperties(obj.sprRMenuBeeper);

            var sx=startX+offsetX;
            curY=curY+obj.spriteCellSize*obj.scaleFactor+offsetY/2;
            obj.karelStart=obj.createKarelSprite(sx, curY);
            obj.createDropKarelProperties(obj.karelStart);
            obj.karelStartX=sx;
            obj.karelStartY=curY;

            curY=curY+obj.spriteCellSize*obj.scaleFactor+offsetY/2;
            addTextAtCenter(curY+3,"click Karel", 18, "white");
            curY=curY+offsetY/1.5;
            addTextAtCenter(curY+3,"for rotate", 18, "white");

            //curY+=obj.spriteCellSize*obj.scaleFactor+offsetX*2;
            //addTextAtCenter(curY+3,"Map's switch", 20, "yellow");
            //curY+=70;
            //
            //obj.game.add.button(startX+obj.rightMenuSize/2, curY, 'btn_start_map', onBtnStartMap, this).anchor.setTo(0.5, 0.5);
            //curY+=80;
            //obj.game.add.button(startX+obj.rightMenuSize/2, curY, 'btn_final_map', onBtnFinalMap, this).anchor.setTo(0.5, 0.5);

            //curY+=50;
            //addTextAtCenter(curY+3,"Service", 20, "yellow");
            //curY+=70;
            //function onSaveBtn() {
            //    obj.saveMap();
            //}
            //
            //obj.game.add.button(startX+obj.rightMenuSize/2, curY, 'btn_save', onSaveBtn, this).anchor.setTo(0.5, 0.5);
            //curY+=80;
            //obj.game.add.button(startX+obj.rightMenuSize/2, curY, 'btn_quit', onQuitBtn, this).anchor.setTo(0.5, 0.5);
        }

        obj.drawMap();
        obj.addText(160,10,"Karel's map editor. ",32,"red");
        obj.writeCurrentMapName();
        drawRightMenu();
        var canv=$("canvas");
        canv.css("font-size",obj.canvasFontSize);
    };

    var update= function () {
    };

    this.karelOffset=3;

    var divForPhaser=this.element[0];
    try{
        $("canvas").remove();
        //game.world.removeAll();
    } catch (e) {}

    this.game = new Phaser.Game(this.element.width(), this.element.height(), Phaser.CANVAS, divForPhaser, { preload: preload, create: create, update: update});
};

KarelMapEditor.prototype.saveMap=function () {

    function formArrayForExport(map,obj) {
        var res=[];
        for(var y=0;y<obj.mapHeight;y++){
            var line=[];
            for(var x=0;x<obj.mapWidth;x++){
                if(map[y][x].blocked)
                    line.push("x");
                else{
                    if(map[y][x].cellBeepersSprites.length==0)
                        line.push("");
                    else
                        line.push(map[y][x].cellBeepersSprites.length);
                }
            }
            res.push(line);
        }
        return res;
    }

    console.log("save btn pressed");
    var mapName = prompt("Please enter map name", "map name is...");
    console.log("map name is "+mapName);

    var arExpStart=formArrayForExport(this.maps.startMap, this);
    console.log(arExpStart);
    if(this.finalMapEdited)
        var arExpFinal=formArrayForExport(this.maps.finalMap, this);
    else
        var arExpFinal=formArrayForExport(this.maps.startMap, this);
    console.log(arExpFinal);

    var karelStartPos=this.findMapXY(this.karelStart.x, this.karelStart.y);
    console.log(karelStartPos);

    if(this.karelFinal!=undefined)
        var karelFinPos=this.findMapXY(this.karelFinal.x, this.karelFinal.y);
    else {
        var karelFinPos={};
        karelFinPos.x=-1;
        karelFinPos.y=-1;
    }
    console.log(karelFinPos);

    var karelPos0=[];
    karelPos0.push(karelStartPos.x);
    karelPos0.push(karelStartPos.y);
    var karelPos1=[];
    karelPos1.push(karelFinPos.x);
    karelPos1.push(karelFinPos.y);

    var objToSave={
        name:mapName,
        original:{
            map:arExpStart,
            karel:{
                position:karelPos0,
                direction:this.karelStartDir,
                beepers:1000
            }
        },
        final:[{
            map:arExpFinal,
            karel:{
                position:karelPos1,
                direction:this.karelFinalDir
            }
        }],
        description:"problem solving"
    };
    Storage.append('maps', objToSave);
};

KarelMapEditor.prototype.incrMapWidth=function (flagResize) {
    console.log("+ width pressed");
    var map=this.currentMap;
    for(var y=0; y<map.length; y++){
        var cell=new Cell;
        if(!flagResize)
            cell.cellSprite=this.addEmptyCell(this.mapWidth,y);
        map[y].push(cell);
    }
    if(!flagResize)
        this.mapWidth++;
};
KarelMapEditor.prototype.decrMapWidth=function (flagResize) {
    console.log("- width pressed");
    var map=this.currentMap;
    for(var y=0; y<map.length; y++){
        try {
            map[y][this.mapWidth-1].cellSprite.destroy(true);
        } catch (e) {}
        map[y].splice(this.mapWidth-1,1);
    }
    if(!flagResize)
        this.mapWidth--;
};
KarelMapEditor.prototype.incrMapHeight=function (flagResize) {
    console.log("+ height pressed");
    var map=this.currentMap;
    var line=[];
    for(var x=0; x<this.mapWidth; x++){
        var cell=new Cell;
        if(!flagResize)
            cell.cellSprite=this.addEmptyCell(x,this.mapHeight);
        line.push(cell);
    }
    map.push(line);
    if(!flagResize)
        this.mapHeight++;
};
KarelMapEditor.prototype.decrMapHeight=function (flagResize) {
    console.log("- height pressed");
    var map=this.currentMap;
    try {
        for(var x=0; x<this.mapWidth; x++){
            map[this.mapHeight-1][x].cellSprite.destroy(true);
        }
    } catch (e) {}
    if(!flagResize)
        this.mapHeight--;
    map[this.mapHeight].splice(0);
    map.splice(this.mapHeight,1);
};
KarelMapEditor.prototype.startMap=function () {
    var obj=this;
    function transferWallsToStartMap() {
        for(var y=0;y<obj.mapHeight;y++)
            for(var x=0;x<obj.mapWidth;x++)
                if(obj.maps.finalMap[y][x].blocked)
                    obj.maps.startMap[y][x].blocked=true;
                else
                    obj.maps.startMap[y][x].blocked=false;
    }

    console.log("start map pressed");
    obj.currentMap=obj.maps.startMap;

    if((obj.currentMap.length!=obj.mapHeight)||(obj.currentMap[0].length!=obj.mapWidth))
        obj.resizeCurrentMap();

    transferWallsToStartMap();

    obj.redrawCurrentMap(obj.maps.finalMap);
    obj.currentMapName="START";
    obj.writeCurrentMapName();
    obj.karelFinal.visible=false;
    obj.karelStart.visible=true;
};
KarelMapEditor.prototype.finalMap=function () {
    var obj=this;
    obj.finalMapEdited=true;
    function transferWallsToFinalMap() {
        for(var y=0;y<obj.mapHeight;y++)
            for(var x=0;x<obj.mapWidth;x++)
                if(obj.maps.startMap[y][x].blocked)
                    obj.maps.finalMap[y][x].blocked=true;
                else
                    obj.maps.finalMap[y][x].blocked=false;
    }

    console.log("final map pressed");
    obj.currentMap=obj.maps.finalMap;

    if((obj.currentMap.length!=obj.mapHeight)||(obj.currentMap[0].length!=obj.mapWidth))
        obj.resizeCurrentMap();

    transferWallsToFinalMap();

    obj.redrawCurrentMap(obj.maps.startMap);
    obj.currentMapName="FINAL";
    obj.writeCurrentMapName();

    obj.karelStart.visible=false;
    if(obj.karelFinal==undefined){
        obj.karelFinal=obj.createKarelSprite(obj.karelStartX, obj.karelStartY);
        obj.createDropKarelProperties(obj.karelFinal);
    } else {
        obj.karelFinal.visible=true;
    }
};

KarelMapEditor.prototype.addEmptyCell=function (x,y){
    var realX=x*this.spriteCellSize*this.scaleFactor+this.mapOffsetX,
        realY=y*this.spriteCellSize*this.scaleFactor+this.mapOffsetY;
    return this.createCellSprite(realX,realY,"empty");
};
KarelMapEditor.prototype.createCellSprite=function (realX, realY, name, toTop) {
    if(name=="wall")
        var spr=this.game.add.sprite(realX, realY, 'wall');
    else
        var spr=this.game.add.sprite(realX, realY, 'empty');
    if(toTop==undefined)
        this.game.world.sendToBack(spr);
    var cellScaleFactor=this.scaleFactor*this.realCellSize/spr.height;
    spr.scale.setTo(cellScaleFactor,cellScaleFactor);
    var xy=this.findMapXY(realX,realY);
    spr.name=name+" x"+xy.x+"y"+xy.y+"fr"+spr.frame;
    return spr;
};
KarelMapEditor.prototype.resizeCurrentMap=function () {
    var obj=this;
    if(obj.currentMap.length<obj.mapHeight){
        var deltaY=obj.mapHeight-obj.currentMap.length;
        for(var i=0; i<deltaY; i++)
            obj.incrMapHeight(true);
    } else if (obj.currentMap.length>obj.mapHeight){
        var deltaY=obj.currentMap.length-obj.mapHeight;
        for(var i=0; i<deltaY; i++)
            obj.decrMapHeight(true);
    }
    if(obj.currentMap[0].length<obj.mapWidth){
        var deltaX=obj.mapWidth-obj.currentMap[0].length;
        for(var i=0; i<deltaX; i++)
            obj.incrMapWidth(true);
    } else if (obj.currentMap[0].length>obj.mapWidth){
        var deltaX=obj.currentMap[0].length-obj.mapWidth;
        for(var i=0; i<deltaX; i++)
            obj.decrMapWidth(true);
    }
};
KarelMapEditor.prototype.redrawCurrentMap=function (prevMap) {
    var obj=this;
    for(var y=0; y<obj.mapHeight; y++)
        for(var x=0; x<obj.mapWidth;x++){
            prevMap[y][x].cellSprite.destroy(true);
            if(prevMap[y][x].cellBeepersSprites.length>0){
                for(var i=0;i<prevMap[y][x].cellBeepersSprites.length;i++){
                    prevMap[y][x].cellBeepersSprites[i].destroy(true);
                }
            }
        }
    obj.drawMap();
};
KarelMapEditor.prototype.writeCurrentMapName=function () {
    var obj=this;
    if(obj.textMapName!=undefined)
        obj.textMapName.destroy(true);
    obj.textMapName=obj.addText(500,15,"Current map: "+obj.currentMapName,26,"blue");
};
KarelMapEditor.prototype.addText=function (x,y,_text, size, color) {
    var obj=this;
    var text = obj.game.add.text(x, y, _text);
    text.anchor.set(0.5,0);
    text.align = 'center';
    text.font = 'Arial';
    text.fontWeight = 'bold';
    text.fontSize = size;
    text.fill = color;
    return text;
};
KarelMapEditor.prototype.drawMap=function () {
    var obj=this;
    var map=obj.currentMap;
    for(var x=0; x<map[0].length; x++){
        for(var y=0; y<map.length; y++){
            if(map[y][x].blocked){
                map[y][x].cellSprite=obj.addWallCell(x,y);
            }
            else {
                map[y][x].cellSprite=obj.addEmptyCell(x,y);
                if(map[y][x].cellBeepersSprites.length>0){
                    for(var i=0;i<map[y][x].cellBeepersSprites.length;i++){
                        var spr=obj.createBeeperSprite(map[y][x].cellBeepersSprites[i].x, map[y][x].cellBeepersSprites[i].y,1);
                        obj.createDropBeeperProperties(spr);
                        map[y][x].cellBeepersSprites[i]=spr;
                    }
                }
            }
        }
    }
    obj.mapArea.maxX=x*obj.spriteCellSize*obj.scaleFactor+obj.mapOffsetX;
    obj.mapArea.maxY=y*obj.spriteCellSize*obj.scaleFactor+obj.mapOffsetY;
};
KarelMapEditor.prototype.addWallCell=function (x,y){
    var realX=this.findRealX(x),
        realY=this.findRealY(y);
    return this.createCellSprite(realX,realY,"wall");
};
KarelMapEditor.prototype.createBeeperSprite=function (realX, realY, beeperScaleFactor) {
    var spr=this.game.add.sprite(realX, realY, 'beeper');
    this.beeperScaleFactor=this.scaleFactor*this.realCellSize/spr.height/4;
    var sc=this.beeperScaleFactor;
    if(beeperScaleFactor)
        sc*=beeperScaleFactor;
    spr.scale.setTo(sc,sc);
    return spr;
};
KarelMapEditor.prototype.createDropBeeperProperties=function (elem) {
    var obj=this;
    function onDragStop(sprite, pointer) {
        function addBeeperSpriteOnMap(mapXY, sprite) {
            sprite.name="beeperx"+mapXY.x+"y"+mapXY.y;
            sprite.scale.setTo(obj.beeperScaleFactor,obj.beeperScaleFactor);
            obj.currentMap[mapXY.y][mapXY.x].cellBeepersSprites.push(sprite);
        }
        function createNewRMenuBeeperSprite() {
            obj.sprRMenuBeeper=obj.createBeeperSprite(obj.sprRMenuBeeperX, obj.sprRMenuBeeperY,3);
            obj.createDropBeeperProperties(obj.sprRMenuBeeper);
        }
        function cutOldXYFromName(name) {
            var nm=name.substr(7);
            var yPos=nm.indexOf("y");
            var res={};
            res.x=nm.substr(0,yPos);
            res.y=nm.substr(yPos+1);
            return res;
        }
        function removeBeeperFromOldCellInMap(oldXY,_name) {
            var arBeepersInCell=obj.currentMap[oldXY.y][oldXY.x].cellBeepersSprites;
            for(var i=0; i<arBeepersInCell.length; i++){
                if(arBeepersInCell[i].name==_name){
                    arBeepersInCell.splice(i,1);
                    break;
                }
            }
        }

        console.log("Stop dragging beeper ",elem);

        var mapXY=obj.findMapXY(pointer.x,pointer.y);

        if(sprite.name=="beeper"){
            if(!obj.droppedOnMap(pointer.x,pointer.y))
                return;
            addBeeperSpriteOnMap(mapXY,sprite);
            createNewRMenuBeeperSprite()
        } else { // existing beeper dragged
            var oldXY=cutOldXYFromName(sprite.name);
            if(!obj.droppedOnMap(pointer.x,pointer.y)){ // deleting
                removeBeeperFromOldCellInMap(oldXY,sprite.name);
                sprite.destroy(true);
            } else {
                if(oldXY.x==mapXY.x&&oldXY.y==mapXY.y) //same cell
                    return;
                else { // dragged from one to another one cell
                    removeBeeperFromOldCellInMap(oldXY,sprite.name);
                    addBeeperSpriteOnMap(mapXY,sprite);
                }
            }
        }
    }
    elem.name="beeper";
    elem.inputEnabled = true;
    elem.input.enableDrag();
    elem.events.onDragStop.add(onDragStop, this);
};
KarelMapEditor.prototype.createKarelSprite=function (x,y,angle){
    var obj=this;
    if(angle==undefined)
        var _karelImg='karel';
    else
        var _karelImg='karelFlipped';
    var spr=obj.game.add.sprite(x, y, _karelImg);
    var sc=obj.scaleFactor*obj.realCellSize/spr.height;
    obj.karelScaleFactor=sc;
    spr.scale.setTo(sc,sc);
    spr.anchor.setTo(0.5, 0.5);
    spr.x=spr.x+spr.width/2;
    spr.y=spr.y+spr.height/2;
    return spr;
};
KarelMapEditor.prototype.createDropKarelProperties=function (elem) {
    var obj=this;
    function isDrag() {
        var distanceFromLastUp = Phaser.Math.distance(
            obj.game.input.activePointer.positionDown.x,obj.game.input.activePointer.positionDown.y,
            obj.game.input.activePointer.x, obj.game.input.activePointer.y);
        if (distanceFromLastUp != 0) {
            return true;
        } else {
            return false;
        }
    }
    function onDragKarelStop(sprite, pointer) {
        console.log("Stop dragging karel",elem);
        if(!obj.droppedOnMap(pointer.x,pointer.y))
            return;
        var mapXY=obj.findMapXY(pointer.x,pointer.y);
        var _x=obj.findRealXForKarel(mapXY.x);
        var _y=obj.findRealYForKarel(mapXY.y);
        if(obj.currentMapName=="START"){
            obj.karelStart.x=_x;
            obj.karelStart.y=_y;
        } else {
            obj.karelFinal.x=_x;
            obj.karelFinal.y=_y;
        }
    }
    function karelListenerUp() {
        if(isDrag())
            return;
        console.log("karel clicked. Rotate them!");
        obj.turnLeftKarelSprite();
    }
    elem.name="karel";
    elem.inputEnabled = true;
    elem.input.enableDrag();
    elem.events.onDragStop.add(onDragKarelStop, this);
    elem.events.onInputUp.add(karelListenerUp, this);
};
KarelMapEditor.prototype.findRealX=function (x) {
    var obj=this;
    return x*obj.spriteCellSize*obj.scaleFactor+obj.mapOffsetX;
};
KarelMapEditor.prototype.findRealY=function (y) {
    var obj=this;
    return y*obj.spriteCellSize*obj.scaleFactor+obj.mapOffsetY;
};
KarelMapEditor.prototype.findRealXForKarel=function (x) {
    var obj=this;
    return x*obj.spriteCellSize*obj.scaleFactor+obj.mapOffsetX+obj.spriteCellSize*obj.scaleFactor/2;
};
KarelMapEditor.prototype.findRealYForKarel=function (y) {
    var obj=this;
    return y*obj.spriteCellSize*obj.scaleFactor+obj.mapOffsetY+obj.spriteCellSize*obj.scaleFactor/2;
};
KarelMapEditor.prototype.droppedOnMap=function (x, y) {
    var obj=this;
    if( (x>obj.mapOffsetX)&&(x<obj.mapArea.maxX)&&
        (y>obj.mapOffsetY)&&(y<obj.mapArea.maxY))
        return true;
    return false;
};
KarelMapEditor.prototype.turnLeftKarelSprite=function () {
    var obj=this;
    if(obj.currentMapName=="FINAL"){
        obj.karelFinalDir++; if(obj.karelFinalDir=4)obj.karelFinalDir=0;
        obj.karelFinal.angle-=90;
        if(((obj.karelFinal.angle==0)||
            (Math.abs(obj.karelFinal.angle)==180))){
            obj.flipKarelSprite();
        }
    } else{
        obj.karelStartDir++;if(obj.karelStartDir=4)obj.karelStartDir=0;
        obj.karelStart.angle-=90;
        if(((obj.karelStart.angle==0)||
            (Math.abs(obj.karelStart.angle)==180))){
            obj.flipKarelSprite();
        }
    }
}
KarelMapEditor.prototype.findMapXY=function (x, y) {
    var res={};
    res.x=~~((x-this.mapOffsetX)/(this.spriteCellSize*this.scaleFactor));
    res.y=~~((y-this.mapOffsetY)/(this.spriteCellSize*this.scaleFactor));
    return res;
};
KarelMapEditor.prototype.flipKarelSprite=function () {
    var obj=this;
    var karel=obj.karelStart;
    if(obj.currentMapName=="FINAL") {
        if (obj.karelFinalFlipped) {
            obj.karelFinal.loadTexture('karel');
            obj.karelFinal.angle = 0;
            obj.karelFinalFlipped = false;
        } else {
            obj.karelFinal.loadTexture('karelFlipped');
            obj.karelFinal.angle = 0;
            obj.karelFinalFlipped = true;
        }
    } else {
        if (obj.karelStartFlipped) {
            obj.karelStart.loadTexture('karel');
            obj.karelStart.angle = 0;
            obj.karelStartFlipped = false;
        } else {
            obj.karelStart.loadTexture('karelFlipped');
            obj.karelStart.angle = 0;
            obj.karelStartFlipped = true;
        }
    }
}
KarelMapEditor.prototype.destroy=function(){
    this.game.world.destroy();
};