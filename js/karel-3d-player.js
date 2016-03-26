function Karel3dPlayer(elem, map) {

    this.elem = elem;
    this.map = map;
	this.world = new Karel3DWorld();
	this.execFlag = false;
	this.stopFlag = true;

    this.world.initializeRenderer(this.elem);
    this.world.initializeCamera(this.elem);

	this.resetWorld();
}

Karel3dPlayer.prototype.resetWorld = function() {
	this.execFlag = false;
	this.stopFlag = false;
	this.pause();
	this.world.clear();
	this.setMap(this.map);
	var self = this;
	setTimeout(function() { self.resume(); }, 700);
}

Karel3dPlayer.prototype.setMap = function(map) {
	this.map = map;
	this.world.loadMap(this.map);
}

Karel3dPlayer.prototype.playScenario = function(scenario, callback) {
	if (!this.execFlag) {
		this.scenario = scenario;
		this.callback = callback;
		this.execFlag = true;
		var see = new SequenceEventExecutor(this.world);
		for (var i = 0; i < scenario.length; i++) {
			command = scenario[i].command;
			if (command == 'move') {
				see.addEvent(this.world.karelMove, 0.5);
			}
			else if (command == 'rotate') {
				if (scenario[i].data.angle == -1) {
					see.addEvent(this.world.karelTurnLeft, 0.25);
				} else if (scenario[i].data.angle == 1) {
					see.addEvent(this.world.karelTurnRight, 0.25);
				}
			}
			else if (command == 'pick') {
				see.addEvent(this.world.karelTakeBeeper);
			}
			else if (command == 'put') {
				see.addEvent(this.world.karelPutBeeper);
			}
			else if (command == 'error') {
				see.addEvent(see.callbackAlert, scenario[i].data.message);
			}
		}
		see.execute(callback);
	}
}

Karel3dPlayer.prototype.pause = function() {
	if (!this.stopFlag) {
		this.stopFlag = true;
		this.world.stopWorld();
	}
}

Karel3dPlayer.prototype.resume = function() {
	if (this.stopFlag) {
		this.stopFlag = false;
		this.world.startWorld();
	}
}

Karel3dPlayer.prototype.stop = function() {
	this.pause();
	setTimeout(
        (function(self) {
            return function() {
                self.resetWorld();
            }
        })(this)
        ,200
    );
}

Karel3dPlayer.prototype.play = function(scenario, callback) {
	this.stop();
	var fn = (arguments.length == 0) ? 
	setTimeout(
        (function(self) {
			return function() {
	            self.playScenario(self.scenario, self.callback);
	        }
		})(this), 300
	) :
	setTimeout(
		(function(self) {
			return function() {
	            self.playScenario(scenario, callback);
	        }
		})(this), 300
	);
}

Karel3dPlayer.prototype.destroy = function() {
	this.world.clear();
	this.stop();
	return 0;
}

Karel3dPlayer.prototype.setSpeed = function(speed) {
	this.world.setSpeed(speed);
}