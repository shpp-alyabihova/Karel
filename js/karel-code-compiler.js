var KarelCodeCompiler = (function (){
    var compiler = {};

    function myPrivateFunctionToCompileCodeAndReturnCommands(code, maps, lang) {
        var language = lang || 'js';
        var result = false;
        var resultActions = [];
        var limitCommands = 1000;
        var map = new Field(maps.original.map);
        var myKarel = new Karel(maps.original.karel.position[0], maps.original.karel.position[1], maps.original.karel.direction, maps.original.karel.beepers);

        // Java and C++ simulation
//======================================================================================================================
        function adaptCode (commands) {
            if (language == 'java') {
                var idxStart = commands.indexOf("{");
                var idxEnd = commands.lastIndexOf("}");
                commands = commands.substring(idxStart + 1, idxEnd);
            }
            commands = commands
                .replace(/int /g, "var ")
                .replace(/public/g, "")
                .replace(/private/g, "")
                .replace(/void/g, "function")
                .replace(/throws Exception/g, "");
            commands = (language == "java")
                ? commands.replace(/run\(\)/g, "runKarelRunRunRun()")
                : commands.replace(/main\(\)/g, "runKarelRunRunRun()");
            return commands += 'runKarelRunRunRun();';
        }
        //adapt functions and logging
//======================================================================================================================
        var listReturnBoolFunc = ["beepersPresent", "noBeepersPresent", "frontIsBlocked", "rightIsClear", "rightIsBlocked", "leftIsClear", "leftIsBlocked",
            "facingNorth", "notFacingNorth", "facingSouth", "notFacingSouth", "facingEast", "notFacingEast", "facingWest", "notFacingWest", "frontIsClear"];

        listReturnBoolFunc = listReturnBoolFunc.map(function(name) {
            return "var " + name + " = function(){pushActions('" + name + "', '" + name + "'); return myKarel['" + name + "']();}\n";
        });

        var overriddenReturnBoolFunc = listReturnBoolFunc.reduce(function(concatStr, currentStr) {
            return concatStr + currentStr;
        });

        function funcKarel(nickname, option) {
            var name = arguments.callee.caller.name.toString();
            var msg = myKarel[name]();
            if (msg) {
                crash(msg);
            }
            nickname = nickname || name;
            pushActions(nickname, name, option);
        }

        function move() {
            funcKarel("move");
        }
        function turnLeft() {
            funcKarel("rotate", {angle: -1});
        }
        function turnRight() {
            funcKarel("rotate", {angle: 1});
        }
        function pickBeeper() {
            funcKarel("pick");
        }
        function putBeeper() {
            funcKarel("put");
        }
//======================================================================================================================

        function Field(map) {
            this.map = map;
        }

        function Karel(x, y, direction, beepers) {
            this.x = x;
            this.y = y;
            this.direction = direction;
            this.beeperInBag = beepers;
        }

        Field.prototype.isAvailable = function (x, y) {
            if (y >= 0 && y < this.map.length && x >=0 && x < this.map[y].length){
                return (this.map[y][x] !== 'x');
            }
            return false;
        };

        Field.prototype.checkBeeper = function (x, y) {
            if (this.map[y][x] == '')
                return 0;
            else
                return this.map[y][x];
        };

        var directions = {
            south: 0,
            east: 1,
            north: 2,
            west: 3
        };

        function pushActions(command, originalName, detail){
            var commandsList = {};
            commandsList.command = command;
            commandsList.original = originalName;
            if(detail) {
                commandsList.data = detail;
            }
            resultActions.push(commandsList);
            if (resultActions.length == limitCommands) {
                crash("infinity loop");
            }
        }

//compatibility with beepers
//======================================================================================================================
        Karel.prototype.beepersPresent = function () {
            return map.checkBeeper(this.x, this.y) != 0;
        };

        Karel.prototype.noBeepersPresent = function () {
            return !this.beepersPresent();
        };

        Karel.prototype.putBeeper = function () {
            if (this.beeperInBag){
                map.map[this.y][this.x] = map.checkBeeper(this.x, this.y) + 1;
                this.beeperInBag--;
            }
            else{
                return ('there are no beepers in the bag');
            }
        };

        Karel.prototype.pickBeeper = function () {
            if (map.checkBeeper(this.x, this.y)){
                map.map[this.y][this.x] = map.checkBeeper(this.x, this.y) - 1;
                this.beeperInBag++;
            }
            else {
                return('there are no beepers here');
            }
        };

        Karel.prototype.noBeepersInBag = function () {
            return this.beeperInBag === 0;
        };

        Karel.prototype.beepersInBag = function () {
            return !this.noBeepersInBag();
        };

//check direction
//======================================================================================================================
        Karel.prototype.facingNorth = function () {
            return this.direction === directions.north;
        };

        Karel.prototype.notFacingNorth = function () {
            return !this.facingNorth();
        };

        Karel.prototype.facingSouth = function () {
            return this.direction === directions.south;
        };

        Karel.prototype.notFacingSouth = function () {
            return !this.facingSouth();
        };

        Karel.prototype.facingWest = function () {
            return this.direction === directions.west;
        };

        Karel.prototype.notFacingWest = function () {
            return !this.facingWest();
        };

        Karel.prototype.facingEast = function () {
            return this.direction === directions.east;
        };

        Karel.prototype.notFacingEast = function () {
            return !this.facingEast();
        };

//check front
//======================================================================================================================

        Karel.prototype.frontIsClear = function () {
            if (this.direction === directions.south) {
                return (map.isAvailable(this.x, this.y + 1));
            } else if (this.direction === directions.east) {
                return (map.isAvailable(this.x + 1, this.y));
            } else if (this.direction === directions.north) {
                return (map.isAvailable(this.x, this.y - 1));
            } else if (this.direction === directions.west) {
                return (map.isAvailable(this.x - 1, this.y));
            }
            return false;
        };

        Karel.prototype.frontIsBlocked = function () {
            return !this.frontIsClear();
        };

        Karel.prototype.leftIsClear = function () {
            if (this.direction === directions.south) {
                return (map.isAvailable(this.x + 1, this.y));
            } else if (this.direction === directions.east) {
                return (map.isAvailable(this.x, this.y - 1));
            } else if (this.direction === directions.north) {
                return (map.isAvailable(this.x - 1, this.y));
            } else if (this.direction === directions.west) {
                return (map.isAvailable(this.x, this.y + 1));
            }
            return false;
        };

        Karel.prototype.leftIsBlocked = function () {
            return !this.leftIsClear();
        };

        Karel.prototype.rightIsClear = function () {
            if (this.direction === directions.south) {
                return (map.isAvailable(this.x - 1, this.y));
            } else if (this.direction === directions.east) {
                return (map.isAvailable(this.x, this.y + 1));
            } else if (this.direction === directions.north) {
                return (map.isAvailable(this.x + 1, this.y));
            } else if (this.direction === directions.west) {
                return (map.isAvailable(this.x, this.y - 1));
            }
            return false;
        };

        Karel.prototype.rightIsBlocked = function () {
            return !this.rightIsClear();
        };


// move()
//======================================================================================================================
        Karel.prototype.move = function () {
            var dX = 0, dY = 0, success = 0;
            if (this.direction === directions.south) {
                if (map.isAvailable(this.x, this.y + 1))
                    success = dY = 1;
            } else if (this.direction === directions.east) {
                if (map.isAvailable(this.x + 1, this.y))
                    success = dX = 1;
            } else if (this.direction === directions.north) {
                if (map.isAvailable(this.x, this.y - 1))
                    success = dY = -1;
            } else if (this.direction === directions.west) {
                if (map.isAvailable(this.x - 1, this.y))
                    success = dX = -1;
            }
            if (!success)
                return('Karel can not move forward');
            else {
                this.x += dX;
                this.y += dY;
            }
        };

//turns
//======================================================================================================================
        Karel.prototype.turnLeft = function () {
            this.direction = (this.direction + 1) % 4;
        };

        Karel.prototype.turnRight = function () {
            this.direction = (this.direction - 1) % 4;
        };

//crash
//======================================================================================================================
        function crash(err_msg) {
            pushActions('error', 'error', {message: err_msg});
            throw resultActions;
        }

        //compare result and final maps samples
//======================================================================================================================

        function compareMaps(templateMaps, resultMap) {
            for (var map = 0; map < templateMaps.length; map++){
                if(compareTwoMaps(templateMaps[map].map, resultMap)) {
                    return true;
                }
            }
            return false;
        }

        function compareTwoMaps(templateMap, resultMap) {
            for (var i = 0; i < templateMap.length; i++) {
                for (var j = 0; j < templateMap[i].length; j++) {
                    if (templateMap[i][j] != resultMap[i][j]) {
                        return false;
                    }
                }
            }
            return true;
        }

        //code execution
//======================================================================================================================

        if (language !== 'js') {
            code = adaptCode(code);
        } else if (code.search(/(run\s*\(\s*\)(?!\s*{))/) == -1) {
            code = code + "\nrun();";
        }
        try {
            code = overriddenReturnBoolFunc + code;
            eval(code);
            resultActions.push({command: 'finish'});
        } catch(e) {
            if (resultActions.length === 0 || resultActions[resultActions.length - 1].command !== 'error') {
                var msg_err = e.toString();
                console.log(e);
                resultActions.push({command: 'error', data: {message : msg_err.split(' ')[1] + ' is not defined'}});
            }
        }

        if (resultActions[resultActions.length - 1].command == 'finish') {
            result = compareMaps(maps.final, map.map);
        }

        //filtering out of static commands
//======================================================================================================================
        for (var i = 0; i < resultActions.length; i++) {
            if (resultActions[i].command !== 'move' &&
                resultActions[i].command !== 'pick' &&
                resultActions[i].command !== 'put' &&
                resultActions[i].command !== 'rotate' &&
                resultActions[i].command !== 'error' &&
                resultActions[i].command !== 'finish'){
                resultActions.splice(i, 1);
                i--;
            }
        }

        return {commands: resultActions, result: result};
    }

    compiler.compile = function (userCode, map, lang) {
        var map_clone = JSON.stringify(map);
        return myPrivateFunctionToCompileCodeAndReturnCommands(userCode, JSON.parse(map_clone), lang);
    };
    return compiler
})();