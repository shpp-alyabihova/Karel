function webglAvailable() {
    try {
        var canvas = document.createElement("canvas");
        return !!
            window.WebGLRenderingContext && 
            (canvas.getContext("webgl") || 
                canvas.getContext("experimental-webgl"));
    } catch(e) { 
        return false;
    } 
}

function KarelPlayer(elem, map, forseRenderer) {

	forceRenderer = forseRenderer || '3D';
	// console.log(forceRenderer, webglAvailable(), (webglAvailable() && forceRenderer == '3D'));
    this.elem = elem;
    this.map = map;
	this.execFlag = false;
	this.stopFlag = true;
	this.world = (webglAvailable() && forceRenderer == '3D') ? new Karel3DWorld() : new Karel2DWorld();

    this.world.initialize(this.elem);

	this.resetWorld();
}

KarelPlayer.prototype.resetWorld = function() {
	this.execFlag = false;
	this.stopFlag = false;
	this.pause();
	this.world.clear();
	this.setMap(this.map);
	var self = this;
	setTimeout(function() { self.resume(); }, 700);
}

KarelPlayer.prototype.setMap = function(map) {
	this.map = map;
	this.destroy();
	this.world.loadMap(this.map);
}

KarelPlayer.prototype.playScenario = function(scenario, callback) {
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
				see.addEvent(this.world.karelTakeBeeper, 0.25);
			}
			else if (command == 'put') {
				see.addEvent(this.world.karelPutBeeper, 0.25);
			}
			else if (command == 'error') {
				see.addEvent(see.callbackAlert, scenario[i].data.message);
			}
		}
		see.execute(callback);
	}
}

KarelPlayer.prototype.pause = function() {
	if (!this.stopFlag) {
		this.stopFlag = true;
		this.world.stopWorld();
	}
}

KarelPlayer.prototype.resume = function() {
	if (this.stopFlag) {
		this.stopFlag = false;
		this.world.startWorld();
	}
}

KarelPlayer.prototype.stop = function() {
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

KarelPlayer.prototype.play = function(scenario, callback) {
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

KarelPlayer.prototype.destroy = function() {
	this.world.clear();
	this.pause();
}

KarelPlayer.prototype.setSpeed = function(speed) {
	this.world.setSpeed(speed);
}