var DEF_CELL_WIDTH = 75;
var DEF_CELL_HEIGHT = 10;
var DEF_KAREL_RADIUS = 20;
var DEF_BEEPER_SIZE = 10;
var ANIMATION_SPEED_RANGE = [0.5, 5];
var DIRECTION_PRESET_ARRAY = [ [0,-1], [1,0], [0,1], [-1,0] ];
var BEEPER_POSITIONS_PRESET_ARRAY = [
    [                                                                                                           ],
    [ [0,0]                                                                                                     ],
    [ [-0.25,-0.25],    [0.25,0.25]                                                                             ],
    [ [-0.3, -0.3],     [0,0],              [0.3, 0.3]                                                          ],
    [ [-0.25,-0.25],    [0.25,0.25],        [0.25,-0.25],       [-0.25,0.25]                                    ],
    [ [-0.3,-0.3],      [0.3,0.3],          [0.3,-0.3],         [-0.3,0.3],         [0,0]                       ],
    [ [-0.25, -0.3],    [-0.25, 0],         [-0.25, 0.3],       [0.25, -0.3],       [0.25, 0],      [0.25, 0.3] ]
];
var COLOR = {
    cell: '#CCCCCC',
    core: '#0077FF',
    wall: '#AAAAAA',
    beeper: '#00FF00',
    karelCloch: '#FFC400',
    karelSkin: '#E5E3E3',
    karelExtras: '#F1F1F1'
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

function radToDeg(rad) {
    return rad / (Math.PI / 180);
}

function bind(func, context) {
    return function() {
        return func.apply(context, arguments);
    }
}

function nextDirection(dir) {
    return (dir >= 3) ? 0 : dir+1;
}

function prevDirection(dir) {
    return (dir <= 0) ? 3 : dir-1;
}


/**
 * [Karel3DWorld description]
 * Class that represents Karel-The-Robot world 3D
 * Contains graphics engine and event-based player of Karel's moves
 */
function Karel3DWorld() {
    THREE.ImageUtils.crossOrigin = '';
    this.scene      = new THREE.Scene();
    this.tl         = new THREE.TextureLoader();
    this.camera     = null;
    this.renderer   = null;
    this.karel      = null;
    this.map        = null;
    this.animation  = {};
    this.animSpeed  = 1;
}

/**
 * [loadMap description]
 * Function analize input Karel's world map (array of strings) and genetare 3D-graphics analog
 * @param  {String[]} map -- array of strings, each string is a map row
 */
Karel3DWorld.prototype.loadMap = function(mapObj) {
    this.map = [];
    var map = mapObj.map;
    var karelObj = mapObj.karel;

    for (var y = 0; y < map.length; y++) {
        var row = [];
        for (var x = 0; x < map[y].length; x++) {
            this.createCellBase(x, y);
            if (map[y][x] == 'x') {
                this.createWall(x, y);
                row.push({ amount: -1, beepers: null });
            } 
            else if (parseInt(map[y][x]) > 0) {
                var amount = parseInt(map[y][x]);
                var beepers = this.createBeepers(x, y, amount);
                row.push({ amount: amount, beepers: beepers });
            }
            else {
                row.push({ amount: 0, beepers: null });
            }
        }
        this.map.push(row);
    }

    this.createKarel(
        karelObj.position[0],
        karelObj.position[1],
        karelObj.direction
    );

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(1, 2, 3);
    this.scene.add( dirLight );

    var ambLight = new THREE.AmbientLight( 0x707070 );
    this.scene.add( ambLight );

    var diff = (this.map.length - this.map[0].length) / 4;
    this.camera.position.set(
        // this.map[0].length * DEF_CELL_WIDTH / -1,
        // this.map.length * DEF_CELL_WIDTH / -0.66,
        (-1 - diff) * DEF_CELL_WIDTH, 
        (-1 * this.map.length + diff) * DEF_CELL_WIDTH, 
        300
    );

}

/**
 * [initialize description]
 * Scene initialization entry point
 * Standart intarface for KarelPlayer usage
 */
Karel3DWorld.prototype.initialize = function (container) {
    this.initializeRenderer(container);
    this.initializeCamera(container);
}

/**
 * [initializeRenderer description]
 * System client renderer initialization function
 */
Karel3DWorld.prototype.initializeRenderer = function(container) {

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( container.width(), container.height() );
    container.append( this.renderer.domElement );
}

/**
 * [initializeCamera description]
 * Client camera initialization function
 */
Karel3DWorld.prototype.initializeCamera = function(container) {

    this.camera = new THREE.OrthographicCamera(
        container.width()/-2, 
        container.width()/2, 
        container.height()/2, 
        container.height()/-2, 
        1, 
        1000 
    );

    this.camera.rotation.set(
        degToRad(45),
        degToRad(-35),
        degToRad(-30)
    );

    var self = this;

    container.mousedown(function(e) {
        container.pressed = true;
        container.startX = e.pageX;     
        container.startY = e.pageY;
        container.cameraX = self.camera.position.x;   
        container.cameraY = self.camera.position.y;   
    });

    $(document).mouseup(function(e) {
        container.pressed = false;
    });

    container.mousemove(function(e) {
        if (container.pressed) {
            dX = e.pageX - container.startX;
            dY = e.pageY - container.startY;
            self.camera.position.x = container.cameraX - ( dX * 0.95- dY * 0.65 );
            self.camera.position.y = container.cameraY + ( dX * 0.25 + dY * 1.25 );
        }
    });
}

/**
 * [createCellBase description]
 * Function generates appropriate empty-cell base with mentioned position in a karel's world field
 * @param  {integer} X -- x-coordinate of cell in the field
 * @param  {integer} Y -- y-coordinate of cell in the field
 */
Karel3DWorld.prototype.createCellBase = function(X, Y) {
    
    var width = DEF_CELL_WIDTH - 5;
    var cellGeometry = new THREE.BoxGeometry( width, width, DEF_CELL_HEIGHT );
    var cellMaterial = new THREE.MeshLambertMaterial( { color: COLOR.cell } );
    var cell = new THREE.Mesh( cellGeometry, cellMaterial );

    var coreGeometry = new THREE.BoxGeometry( DEF_CELL_WIDTH, DEF_CELL_WIDTH, DEF_CELL_HEIGHT/4 );
    var coreMaterial = new THREE.MeshLambertMaterial( { color: COLOR.core } );
    var core = new THREE.Mesh( coreGeometry, coreMaterial );

    cell.position.x = core.position.x = X * DEF_CELL_WIDTH;
    cell.position.y = core.position.y = -1 * Y * DEF_CELL_WIDTH;

    this.scene.add(cell);
    this.scene.add(core);
}

/**
 * [createWall description]
 * Function generates 3D wall object and put it to appropriate field cell
 * @param  {integer} X -- x-coordinate of cell in the field
 * @param  {integer} Y -- y-coordinate of cell in the field
 */
Karel3DWorld.prototype.createWall = function(X, Y) {
    
    var material = new THREE.MeshPhongMaterial( { color: COLOR.wall, shading: THREE.FlatShading, shininess: 500 } );
    var side = DEF_CELL_WIDTH/2 - 7;
    var range = {
        min: 1,
        max: 1.5
    };

    for (var i = 0; i < 2; i++)
        for (var j = 0; j < 2; j++) {
            var geometry = new THREE.Geometry();
            var height = Math.round(Math.random() * (side*1.5 - side*1) + side*1);
            
            geometry.vertices = [
                new THREE.Vector3( -side/2, -side/2, 0 ),
                new THREE.Vector3( -side/2, side/2, 0 ),
                new THREE.Vector3( side/2, side/2, 0 ),
                new THREE.Vector3( side/2, -side/2, 0 ),
                new THREE.Vector3( 0, 0, height )
            ];

            geometry.faces = [
                new THREE.Face3( 0, 1, 2 ),
                new THREE.Face3( 0, 2, 3 ),
                new THREE.Face3( 1, 0, 4 ),
                new THREE.Face3( 2, 1, 4 ),
                new THREE.Face3( 3, 2, 4 ),
                new THREE.Face3( 0, 3, 4 )
            ]; 

            geometry.computeFaceNormals();
            geometry.computeVertexNormals();

            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (X + 0.5*i - 0.25) * DEF_CELL_WIDTH,
                -1 * (Y + 0.5*j - 0.25) * DEF_CELL_WIDTH,
                DEF_CELL_HEIGHT/2
            );

            var scale = Math.random() * (1 - 0.8) + 0.8;
            mesh.scale.set(scale, scale, scale);
            this.scene.add(mesh);
        }
}

/**
 * [createBeepers description]
 * Creates multiple beeper objects (1-6), places them to appropriate cell and returns array of those objects
 * @param  {integer}        X      -- x-coordinate of cell in the field
 * @param  {integer}        Y      -- y-coordinate of cell in the field
 * @param  {integer}        amount -- number of beepers to put to a cell
 * @return {THREE.Mesh[]}          -- array of created object3D beeper-instances
 */
Karel3DWorld.prototype.createBeepers = function(X, Y, amount) {

    // var texture = this.tl.load( 'img/textures/beeper.png' );
    var material = new THREE.MeshPhongMaterial( { color: COLOR.beeper } );
    var retVal = [];

    if (amount > 0 && amount < 7) {
        var geometry = new THREE.BoxGeometry( DEF_BEEPER_SIZE, DEF_BEEPER_SIZE, DEF_BEEPER_SIZE );
        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.x = X * DEF_CELL_WIDTH;
        mesh.position.y = -1 * Y * DEF_CELL_WIDTH;
        mesh.position.z = DEF_CELL_HEIGHT * 0.5;

        mesh.rotation.x = degToRad(45);
        mesh.rotation.z = degToRad(45);

        for (var i = 0; i < amount; i++) {
            var beeper = mesh.clone();
            beeper.position.x += BEEPER_POSITIONS_PRESET_ARRAY[amount][i][0] * DEF_CELL_WIDTH;
            beeper.position.y -= BEEPER_POSITIONS_PRESET_ARRAY[amount][i][1] * DEF_CELL_WIDTH;
            retVal.push(beeper);
            this.scene.add(beeper);
        }
    }

    return retVal;
}

/**
 * [createKarel description]
 * Creates Karel-The-Robot 3D object and placing it to appropriate cell with appropriate facing (direction)
 * @param  {integer} X         -- x-coordinate of cell in the field
 * @param  {integer} Y         -- y-coordinate of cell in the field
 * @param  {integer} direction -- initial facing of the robot, indexing DIRECTION_PRESET_ARRAY
 */
Karel3DWorld.prototype.createKarel = function(X, Y, direction) {
    
    this.karel = {};
    this.karel.x = X;
    this.karel.y = Y;
    this.karel.direction = direction || 0;
    this.karel.mesh = null;

    var loader = new THREE.JSONLoader();
    var texLoader = new THREE.TextureLoader();
    var self = this;

    var xPos = X * DEF_CELL_WIDTH;
    var yPos = -1 * Y * DEF_CELL_WIDTH;
    var zPos = 0;
    // (-this.karel.direction + 1) * 90
    var xRot = degToRad(90);
    var yRot = degToRad(0);
    var zRot = degToRad(0);

    var scale = 12;

    this.karel.mesh = new THREE.Group();
    this.karel.mesh.position.set(xPos, yPos, zPos);
    // this.karel.mesh.rotation.set(xRot, yRot, zRot);
    this.karel.mesh.scale.set(scale, scale, scale);

    this.scene.add(this.karel.mesh);

    loader.load('./meshes/karel-cap.json', function(geometry) {
        var material = new THREE.MeshLambertMaterial( { color: COLOR.karelCloch } );
        var mesh =  new THREE.Mesh( geometry, material );
        self.karel.mesh.add(mesh);

        mesh.rotation.set(xRot, yRot, zRot); 
    });

    loader.load('./meshes/karel-body.json', function(geometry) {
        var material = new THREE.MeshLambertMaterial( { color: COLOR.karelSkin } );
        var mesh =  new THREE.Mesh( geometry, material );
        self.karel.mesh.add(mesh);

        mesh.rotation.set(xRot, yRot, zRot); 
    }); 

    loader.load('./meshes/karel-face.json', function(geometry) {
        var material = new THREE.MeshLambertMaterial( { color: COLOR.karelExtras } );
        var mesh =  new THREE.Mesh( geometry, material );
        self.karel.mesh.add(mesh);

        mesh.rotation.set(xRot, yRot, zRot);
    });    
}

/**
 * [karelMove description]
 * Animate Karel-The-Robot to move forward for a one step, according to it's current facing
 * @param  {float}    duration -- duration of movement (in seconds)
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelMove = function(duration, callback, args) {

    var fps = 60;
    var frames = duration * fps;
    var modidier = DEF_CELL_WIDTH / frames;
    
    this.karel.x += DIRECTION_PRESET_ARRAY[this.karel.direction][0];
    this.karel.y -= DIRECTION_PRESET_ARRAY[this.karel.direction][1];

    this.animation = {};
    this.animation.px = modidier * DIRECTION_PRESET_ARRAY[this.karel.direction][0];
    this.animation.py = modidier * DIRECTION_PRESET_ARRAY[this.karel.direction][1];
    this.animation.rz = 0;
    this.animation.frames = frames;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [karelTurnLeft description]
 * Animate Karel-The-Robot to turn left a 90 degrees and change it's facing
 * @param  {float}    duration -- duration of movement (in seconds)
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelTurnLeft = function(duration, callback, args) {

    var fps = 60;
    var frames = duration * fps;
    var modidier = degToRad(90) / frames;
    
    this.karel.direction = nextDirection(this.karel.direction);
    
    this.animation = {};
    this.animation.px = 0;
    this.animation.py = 0;
    this.animation.rz = modidier;
    this.animation.frames = frames;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [karelTurnRight description]
 * Animate Karel-The-Robot to turn Right a 90 degrees and change it's facing
 * @param  {float}    duration -- duration of movement (in seconds)
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelTurnRight = function(duration, callback, args) {

    var fps = 60;
    var frames = duration * fps;
    var modidier = degToRad(90) / frames;
    
    this.karel.direction = prevDirection(this.karel.direction);
    
    this.animation = {};
    this.animation.px = 0;
    this.animation.py = 0;
    this.animation.rz = -modidier;
    this.animation.frames = frames;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [karelTakeBeeper description]
 * Animate Karel-The-Robot to pick up one beeper from the cell he stands on
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelTakeBeeper = function(duration, callback, args) {

    var fps = 60;
    var X = this.karel.x;
    var Y = this.karel.y;

    this.clearBeepers(this.map[Y][X].beepers);
    if (--this.map[Y][X].amount > 0)
        this.map[Y][X].beepers = this.createBeepers(X, Y, this.map[Y][X].amount);
    
    this.animation = {};
    this.animation.px = 0;
    this.animation.py = 0;
    this.animation.rz = 0;
    this.animation.frames = fps * duration;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [karelPutBeeper description]
 * Animate Karel-The-Robot to put one beeper to the cell he stands on
 * @param  {Function} callback -- callback function
 * @param  {array}    args     -- arguments of the callback function
 */
Karel3DWorld.prototype.karelPutBeeper = function(duration, callback, args) {
    
    var fps = 60;
    var X = this.karel.x;
    var Y = this.karel.y;

    this.clearBeepers(this.map[Y][X].beepers);
    this.map[Y][X].beepers = this.createBeepers(X, Y, ++this.map[Y][X].amount);
    
    this.animation = {};
    this.animation.px = 0;
    this.animation.py = 0;
    this.animation.rz = 0;
    this.animation.frames = fps * duration;
    this.animation.callback = callback;
    this.animation.cbargs = args;
}

/**
 * [clearBeepers description]
 * Removes all beeper objects from the list
 * @param  {THREE.Mesh[]} beeperList -- array of beeper objects to be removed
 */
Karel3DWorld.prototype.clearBeepers = function(beeperList) {
    if (beeperList)
        for (var i = 0; i < beeperList.length; i++)
            this.scene.remove(beeperList[i]);
}

/**
 * [render description]
 * Karel's 3D world rendering function
 */
Karel3DWorld.prototype.render = function() {
    if (!this.stop) {
        if (this.animation) {
            if (this.animation.frames > 0) {
                this.animation.frames -= this.animSpeed;
                this.karel.mesh.position.x += this.animation.px * this.animSpeed;
                this.karel.mesh.position.y += this.animation.py * this.animSpeed;
                this.karel.mesh.rotation.z += this.animation.rz * this.animSpeed;
            } else {
                fn = this.animation.callback;
                args = this.animation.cbargs;
                this.animation = null;
                if (fn && args)
                    setTimeout(
                        (function(self, args) {
                            return function() {
                                fn.apply(self, args);
                            }
                        })(this, args)
                        ,0
                    );
            }
            this.renderer.render( this.scene, this.camera );
        }
        this.animationFrame = requestAnimationFrame( bind(this.render, this) );
    }
}

Karel3DWorld.prototype.clear = function() {
    this.stopWorld();
    this.karel      = null;
    this.map        = null;
    this.animation  = null;
    for( var i = this.scene.children.length - 1; i >= 0; i--)
        this.scene.remove(this.scene.children[i]);
}

Karel3DWorld.prototype.stopWorld = function() {
    this.stop = true;
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
}

Karel3DWorld.prototype.startWorld = function() {
    this.stop = false;
    this.animationFrame = requestAnimationFrame( bind(this.render, this) );
}

Karel3DWorld.prototype.setSpeed = function(speed) {
    var fixed = Math.min(Math.max(parseInt(speed), ANIMATION_SPEED_RANGE[0]), ANIMATION_SPEED_RANGE[1]);
    this.animSpeed = fixed;
}

var world = new Karel3DWorld();
world.initialize($('#renderer'));
world.createKarel();
world.karelTurnRight();
world.karelTurnLeft();