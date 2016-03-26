
document.body.oncontextmenu = function() {
    return false;
};
var start_map = [];
var final_map = [];

var maxCellsInLine = 15;
var minCellsInLine = 1;
var maxFinalMaps = 3;

//Storage.clear('maps');

var visualise = {"visibility": "visible"};
var hide = {"visibility": "hidden"};
//____________________________________________________________buttons___________________________________________________

var $exit_btn = $('#exit-btn');
var $select_map = $('#map-selection-list');
var $reset_btn = $('#reset');
var $start_map = $('#start-map');
var $final_map = $('#final-map');
var $add_final_map = $('#plus-final-map');
var $finalize = $('#finalize');
var $decrement_height = $('#decrement-height');
var $increment_height = $('#increment-height');
var $decrement_width = $('#decrement-width');
var $increment_width = $('#increment-width');
var $wall_cell = $('#wall');
var $empty_cell = $('#empty');
var $beeper_cell = $('#beeper');
var $karel_cell = $('#karel');
var $backpack_cell = $('#backpack');
var $minus = $('#minus');
var $plus = $('#plus');

var $close_final = $('#close-final');
var $complete = $('#complete');
var $name = $('#name');
var $description = $('#description');
var $close_pop_up = $('#close-pop-up');
var $close_alert = $('#close-alert');
var $ok_alert = $('#ok-alert');
var $alert_msg = $('#alert-msg');
var $alert = $('#alert');
var $beepers_count = $('#beepers-count');
var $num_beepers = $('#num-beepers');
/*
var $submit = $('#submit');
*/
var $button_panel = $('#button-panel');
var $map_selector_btn = $('#map-selector-btn');
var $sidebar = $('#sidebar');
var $map_list = $('#world-list-tab');
var $map_field = $('#map-field');
var $val_width = $('#value-width');
var $val_height = $('#value-height');
var $count_beepers = $('#inner');
var $original_map = $('#original-map');
var $final_maps = $('#final-maps');
var $reset_arrow = $('#reset-arrow');
//=================================================active buttons functions=============================================


//_____________________________________________________edit cell buttons________________________________________________

var active_edit_button = false;

function activeToggle (el) {
    $(".btn-cell").css({"box-shadow": "none"});
    if (active_edit_button == el) {
        active_edit_button = false;
    } else {
        active_edit_button = el;
        $(el).css({"box-shadow": "0 0 10px #000"});
    }
}

//_______________________________________________________edit backpack__________________________________________________

var active_backpack = false;

function changeNumBeepersInBackpack() {
    active_backpack = true;
    $beepers_count.css(visualise);
    $num_beepers.val($count_beepers.text()).select();
    $num_beepers.keypress( function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == 13) {
            var result = parseInt($num_beepers.val());
            if (result >= 0 && result <= 1000) {
                $count_beepers.text(result);
            }
            $beepers_count.css(hide);
            active_backpack = false;
        }
    });

}

function hideInput() {
    $beepers_count.css(hide);
    active_backpack = false;
}

//_______________________________________________________show world list________________________________________________

var active_selector = false;


function toggleShowWorldList() {
    if (active_selector) {
        $sidebar.css({"right": "-17em"});
        active_selector = false;
    } else {
        $sidebar.css({"right": "8em"});
        active_selector = true;
    }
}


//__________________________________________________zip map_____________________________________________________________

function zipMap(map) {
    var zippedMap = [];
    var currKarel = {};
    for (var row = 0; row < map.length; row++) {
        zippedMap.push([]);
        for (var cell = 0; cell < map[row].length; cell++) {
            var symbol = '';
            if (map[row][cell].blocked) {
                symbol = 'x';
            } else if (map[row][cell].beepers) {
                symbol = map[row][cell].beepers;
            }
            if (map[row][cell].isKarel) {
                currKarel.position = [cell, row];
                currKarel.direction = map[row][cell].karelDirection % 4;
                currKarel.beepers = $count_beepers.text();
            }
            zippedMap[row].push(symbol);
        }
    }
    return {map: zippedMap, karel: currKarel};
}

//__________________________________________________unzip map___________________________________________________________

function unzipMap(map){
    var resultMap = [];
    for (var y = 0; y < map.map.length; y++) {
        resultMap.push([]);
        for (var x = 0; x < map.map[y].length; x++){
            var cell;
            if (!map.map[y][x]) {
                cell = new Cell();
            } else if (map.map[y][x] == 'x'){
                cell = new Cell(true);
            } else {
                cell = new Cell(false, map.map[y][x]);
            }
            resultMap[y].push(cell);
        }
    }
    if (map.karel.position) {
        cell = resultMap[map.karel.position[1]][map.karel.position[0]];
        resultMap[map.karel.position[1]][map.karel.position[0]] = new Cell(cell.blocked, cell.beepers, true, map.karel.direction);
        $count_beepers.text(map.karel.beepers);
    }
    return resultMap;
}



//===================================================Classes constructors===============================================


function Cell(wall, beepers, karel, direction){
    this.blocked = wall || false;
    this.beepers = beepers || 0;
    this.isKarel = karel || false;
    this.karelDirection = direction || 1;
}

function MapEdited(map) {
    this.map = map;
    this.karel = false;
    this.karelPosition = [-1, -1];
    this.scale = 1;
}


function Maps(maps) {
    this.active_map = "start";
    this.name = maps.name || "new-map";
    this.description = maps.description || "problem solving";
    this.start_map_editor = new MapEdited(unzipMap(maps.original));
    this.final_map_editor = [];
    this.activateFinalMapsEditor(maps.final);
    this.originalMap = {};
    this.finalMap = [];
    this.markActiveMap();
}

function isStartActiveMap(activeMap) {
    return activeMap == "start";
}

//======================================================Method descriptions============================================

Maps.prototype.markActiveMap = function() {
    $(".row").removeClass("highlight");
    var id;
   if (isStartActiveMap(this.active_map)) {
       id = "#start-map";
   } else {
       id = "#final-map" + ((this.active_map) ? this.active_map + 1 : '');
   }
    $(id).addClass("highlight");
};

Maps.prototype.activateFinalMapsEditor = function(maps){
    var _this = this;
    maps.forEach( function (map, idx) {
        _this.addFinalMap(unzipMap(map));
        if (idx > 0) {
            addIconFinalMap(idx + 1);
        }
    })
};

Maps.prototype.addFinalMap = function (map) {
    var _this = this;
    var currentMap = map || JSON.parse(JSON.stringify(basicMap));
    _this.final_map_editor.push(new MapEdited(currentMap));
};

Maps.prototype.removeFinalMap = function (idx) {
    var _this = this;
    _this.final_map_editor.splice(idx, 1);
};
Maps.prototype.getActiveMap = function () {
    var _this = this;
    if (isStartActiveMap(this.active_map)) {
        return _this.start_map_editor;
    } else {
        return _this.final_map_editor[_this.active_map];
    }
};

function referToStartMap(startMap, finalMap) {
    if (finalMap.length !== startMap.length || finalMap[0].length !== startMap[0].length) {
        finalMap = [];
        for (var wdh = 0; wdh < startMap.length; wdh++) {
            finalMap.push([]);
            for (var hgt = 0; hgt < startMap[wdh].length; hgt++) {
                var currentCell = ((startMap[wdh][hgt]).blocked) ? new Cell(true) : new Cell();
                finalMap[wdh].push(currentCell);
            }
        }
    } else {
        for (var wdh = 0; wdh < startMap.length; wdh++) {
            for (var hgt = 0; hgt < startMap[wdh].length; hgt++) {
                if ((startMap[wdh][hgt]).blocked) {
                    finalMap[wdh][hgt] = new Cell(true);
                } else if (finalMap[wdh][hgt].blocked) {
                    finalMap[wdh][hgt] = new Cell();
                }
            }
        }
    }
    return finalMap;
}


Maps.prototype.setActiveMap = function (map) {
    var _this = this;
    _this.active_map = map;
    if (!isStartActiveMap(this.active_map)) {
        _this.final_map_editor[_this.active_map].map = referToStartMap(_this.start_map_editor.map, _this.final_map_editor[_this.active_map].map);
    }
    _this.markActiveMap();
    _this.getActiveMap().redrawMap();
};

Maps.prototype.saveStartMap = function () {
    var _this = this;
    _this.originalMap = zipMap(_this.start_map_editor.map);

};

Maps.prototype.saveFinalMap = function () {
    var _this = this;
    var finalMaps = [];
    _this.final_map_editor.forEach( function (map) {
        finalMaps.push(zipMap(map.map));
    });
    _this.finalMap = finalMaps;
};

Maps.prototype.saveAllMaps = function () {
    var _this = this;
    var maps = {};
    $name.val(_this.name);
    $description.val(_this.description);
    $complete.css(visualise);
    $complete.submit(function (e) {
        e.preventDefault();
        _this.name = ($name.val()) ?  $name.val() : _this.name;
        _this.description = ($description.val()) ? $description.val() : _this.description;
        maps.name = _this.name;
        maps.original = _this.originalMap;
        maps.final = _this.finalMap;
        maps.description = _this.description;
        Storage.addMap(_this.name, maps);
        $complete.css(hide);
        refreshWorldList();
    });
};

Maps.prototype.completeEdit = function () {
    var _this = this;
    _this.saveStartMap();
    if (!_this.originalMap.karel.position){
        alertMessage('You should set Karel on start map!');
    } else {
        _this.saveFinalMap();
        _this.saveAllMaps();
    }
};


//___________________________________________________draw map___________________________________________________________


MapEdited.prototype.createDomMap = function() {
    this.karel = false;
    var table = '<table id="map">';
    for (var row = 0; row < this.map.length; row++) {
        table = table + '<tr>';
        for (var cell = 0; cell < this.map[row].length; cell++) {
            var domCell = analyzeCell(row, cell, this.map[row][cell], this);
            table = table + "<td>" + domCell + "</td>"
        }
        table = table + "</tr>";
    }
    return table + "</table>";
};


function analyzeCell(y, x, cell, ctx){
    var id = "y" + y + "x" + x;
    if (cell.blocked) {
        return '<div class="cell wall" id="' + id + '"></div>';
    }
    var direction;
    if (cell.beepers && cell.isKarel) {
        ctx.karel = true;
        ctx.karelPosition = [x, y];
        direction = renderKarelDirection(cell.karelDirection % 4);
        return '<div class="cell karel ' + direction + '" id="' + id + '"><div class="beeper">' + cell.beepers + '</div></div>';
    }
    if (cell.beepers) {
        return '<div class="cell" id="' + id + '"><div class="beeper">' + cell.beepers + '</div></div>';
    }
    if (cell.isKarel) {
        ctx.karel = true;
        ctx.karelPosition = [x, y];
        direction = renderKarelDirection(cell.karelDirection % 4);
        return '<div class="cell karel ' + direction + '" id="' + id + '"></div>';
    }
    return '<div class="cell" id="' + id + '"></div>';
}


function renderKarelDirection(direction) {
    if (direction == 0) {
        return "direction-south";
    } else if (direction == 2) {
        return "direction-north";
    } else if (direction == 3) {
        return "direction-west"
    } else {
        return "direction-east";
    }
}


//_________________________________________________redraw map__________________________________________________________
MapEdited.prototype.redrawMap = function () {
    var _this = this;
    $map_field.html(_this.createDomMap());

    $('.cell').mousedown(function(e) {
        var id = $(this).attr('id');
        if (e.which == 3) {
            e.preventDefault();
            _this.editMap(id, true);
        } else {
            _this.editMap(id);
        }
    });
    $val_height.text(_this.map.length);
    $val_width.text(_this.map[0].length);
};

// Edit map
//======================================================================================================================

// ___________________________________________resize map _______________________________________________________________


var visibleFieldHeight = $(window).height() - (2 * $('.bottom-panel').height());
var visibleFieldWidth = $(window).width() - 2 * $('#control-editor').width();

MapEdited.prototype.incrementWidth = function() {
    var _this = this;
    if (_this.map[0].length < maxCellsInLine) {
        for (var h = 0; h < _this.map.length; h++) {
            var emptyCell = new  Cell();
            _this.map[h].push(emptyCell);
        }
        if( $('#map').width() * _this.scale > visibleFieldWidth ) {
            _this.scaleMap("decrement");
        }
        _this.redrawMap();
    } else {
        alertMessage("Max field width is reached.");
    }
};

MapEdited.prototype.decrementWidth = function() {
    var _this = this;
    if (_this.map[0].length > minCellsInLine) {
        for (var h = 0; h < _this.map.length; h++) {
            _this.map[h].pop();
        }
        _this.redrawMap();
    }
};

MapEdited.prototype.incrementHeight = function() {
    var _this = this;
    if (_this.map.length < maxCellsInLine) {
        _this.map.push([]);
        for (var w = 0; w < _this.map[0].length; w++) {
            var emptyCell = new Cell();
            _this.map[_this.map.length - 1].push(emptyCell);
        }
        if( $('#map').height() * _this.scale > visibleFieldHeight ) {
            _this.scaleMap("decrement");
        }
        _this.redrawMap();
    } else {
        alertMessage("Max field height is reached.");
    }
};

MapEdited.prototype.decrementHeight = function() {
    var _this = this;
    if (_this.map.length > minCellsInLine){
        _this.map.pop();
        _this.redrawMap();
    }
};

MapEdited.prototype.scaleMap = function(resize) {
    var _this = this;
    if (resize == 'decrement' && _this.scale > 0.5) {
        _this.scale = _this.scale - 0.1;
    } else if (resize == 'increment' && _this.scale < 1) {
        _this.scale = _this.scale + 0.1;
    }
    $map_field.css( 'transform', 'scale(' + _this.scale + ', ' + _this.scale + ')' );
};

//_____________________________________________________edit-cell________________________________________________________

MapEdited.prototype.editMap = function (id, decrement) {
    var pos = id.indexOf('x');
    var y = id.slice(1, pos);
    var x = id.slice(pos + 1);
    var currentCell = this.map[y][x];
    if (active_edit_button) {
        if (active_edit_button == "#wall") {
            mountWall(currentCell);
        } else if (active_edit_button == "#beeper") {
            changeBeepersCount(currentCell, decrement);
        } else if (active_edit_button == "#empty") {
            clearCell(currentCell);
        } else {
            determinateKarelPosition(this, x, y, currentCell, decrement);
        }
    } else if (currentCell.isKarel) {
        currentCell.karelDirection = currentCell.karelDirection % 4 + 1;
    }
    this.redrawMap();
};

function mountWall(cell) {
    if (cell.blocked) {
        cell.blocked = false;
    } else {
        cell.blocked = true;
        cell.beepers = 0;
        removeKarel(cell);
    }
}
function changeBeepersCount(cell, decrement) {
    if (decrement) {
        if (cell.beepers > 1) {
            cell.beepers--;
        } else {
            cell.beepers = false;
        }
    } else {
        cell.blocked = false;
        cell.beepers++;
    }
}

function clearCell(cell) {
    cell.blocked = false;
    cell.beepers = 0;
    removeKarel(cell);
}

function determinateKarelPosition(ctx, x, y, cell, decrement) {
    if (cell.isKarel && decrement) {
        cell.isKarel = false;
        ctx.karel = [-1, -1];
    }  else if (cell.isKarel) {
        cell.karelDirection = cell.karelDirection % 4 + 1;
    } else if (!decrement) {
        cell.isKarel = true;
        cell.blocked = false;
        if (ctx.karel) {
            ctx.map[ctx.karelPosition[1]][ctx.karelPosition[0]].isKarel = false;
        }
        ctx.karel = true;
        ctx.karelPosition = [x, y];
    }
}

function removeKarel(cell) {
    if (cell.isKarel) {
        cell.isKarel = false;
        cell.karelDirection = 1;
    }
}

//_______________________________________________________reset map______________________________________________________

MapEdited.prototype.resetMap = function () {
    var _this = this;
    activeToggle(false);
    _this.map = JSON.parse(JSON.stringify(basicMap));
    _this.scale = 1;
    $map_field.css( 'transform', 'scale(' + _this.scale + ', ' + _this.scale + ')' );
    $map_field.css( 'top', 0);
    $map_field.css( 'left', 0);
    _this.redrawMap();
};


// click buttons
//======================================================================================================================

// ___________________________________________resize map _______________________________________________________________

$increment_width.click(function(){
    setMap.getActiveMap().incrementWidth();
});

$decrement_width.click(function() {
    setMap.getActiveMap().decrementWidth();
});

$increment_height.click(function(){
    setMap.getActiveMap().incrementHeight();
});

$decrement_height.click(function(){
    setMap.getActiveMap().decrementHeight();
});

//_______________________________________________________exit__________________________________________________________

$exit_btn.click(function(){
    window.location.href="./play.html";
});

//_______________________________________________________reset__________________________________________________________


$reset_btn.click(function(){
    $reset_arrow.css({"transform": "rotate(360deg)"});
    $reset_arrow.css({"transition": "all 0.5s linear"});
    setMap.getActiveMap().resetMap();
    setTimeout(function() {
        $reset_arrow.css({"transition": "none"});
        $reset_arrow.css({"transform": "none"})
    }, 1000);
});

//___________________________________________________show start map_____________________________________________________


$start_map.click(function() {
    setMap.setActiveMap("start");
});

//___________________________________________________add remove and show final map_____________________________________________

$final_map.click(function() {
    setMap.setActiveMap(0);
});

$add_final_map.click(function() {
    if (setMap.final_map_editor.length == maxFinalMaps) {
        alertMessage('You can save up to ' + maxFinalMaps + ' final maps.');
    } else {
        setMap.addFinalMap();
        addIconFinalMap(setMap.final_map_editor.length);
    }
});

function addIconFinalMap(item) {
    var icon = createDomElementIcon(item);
    $button_panel.append(icon);
    var idx =  item - 1;
    $('#final-map' + item).click(function() {
        setMap.setActiveMap(idx);
    });
    $('#close-final' + item).click(function() {
         smartRemoveFinalMap(idx);
    });
}

function createDomElementIcon (item) {
    return '<div class="row final-maps optional" id="final-map' + item + '"><div class="button"></div><div class="num">' + item + '</div><div class="cross-sign" id="close-final' + item + '"></div></div>';
}

function smartRemoveFinalMap(idx) {
    if (idx == 0 && setMap.final_map_editor.length == 1) {
        setMap.final_map_editor[idx].resetMap();
    } else {
        $('#final-map' + setMap.final_map_editor.length).remove();
        setMap.removeFinalMap(idx);
    }
}

$close_final.click(function() {
    smartRemoveFinalMap(0);
});

//___________________________________________________save all maps______________________________________________________

$finalize.click(function() {
    setMap.completeEdit();
});

//___________________________________________________map-edit-buttons___________________________________________________


$wall_cell.click(function(){
    activeToggle('#wall');
});

$beeper_cell.click(function(){
    activeToggle('#beeper');
});

$karel_cell.click(function(){
    activeToggle('#karel');
});

$empty_cell.click(function() {
    activeToggle('#empty');
});


$backpack_cell.click(function() {
    if (active_backpack) {
        hideInput();
    } else {
        changeNumBeepersInBackpack();
    }
});

$map_field.mousedown(function() {
    if (!active_edit_button) {
        $map_field.draggable();
    }
});

$minus.click(function() {
    setMap.getActiveMap().scaleMap('decrement');
});

$plus.click(function() {
    setMap.getActiveMap().scaleMap('increment');
});

//________________________________________________other functional buttons________________________________________________

function alertMessage(msg) {
    $alert_msg.text(msg);
    $alert.css(visualise);
}

$close_alert.click( function() {
    $alert.css(hide);
});

$ok_alert.click( function() {
    $alert.css(hide);
});


$close_pop_up.click( function() {
    $complete.css(hide);
});


$map_selector_btn.click( function() {
    toggleShowWorldList();
});

//_____________________________________________________start edit map___________________________________________________

var editorMapSelector = new MapSelector($map_list);

var emptyCell = new Cell();
var basicMap =[[emptyCell]];


var setMap = new Maps({original: {map: [['']], karel: {}}, final: [{map: [['']], karel: {}}]});
setMap.getActiveMap().redrawMap();

function  loadSetMaps(maps) {
    $(".optional").remove();
    setMap = new Maps(maps);
    setMap.getActiveMap().redrawMap();
}

function mapSelectorDeleteCallback(map) {
    Storage.removeMap(map.name);
    refreshWorldList();
}

function refreshWorldList() {
    $map_list.html('<div class="tab-title"><span>World  List</span></div>');
    editorMapSelector.formUlList({
        deleteCallback : mapSelectorDeleteCallback
    });
}

editorMapSelector.onChange(loadSetMaps);
refreshWorldList();