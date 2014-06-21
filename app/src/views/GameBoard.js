/* This View creates the Game Board that joins all the cubes.  It contains the
main cube which is the game board, the destroyer cube which can move around the 
game board to remove small cubes and the small cubes which are targets for the 
destroyer cube to remove*/
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Modifier      = require('famous/core/Modifier');
  var Transform     = require('famous/core/Transform');
  var CubeView      = require('views/CubeView');
  var DestroyerCube = require('views/DestroyerCube');
  var SmallCube     = require('views/SmallCube');


  function GameBoard() {
    View.apply(this, arguments);
    this.is2D = true;
    
    var rootModifier = new Modifier();

    this.node = this.add(rootModifier);

    _createParentCube.call(this);
    _createDestroyerCube.call(this);
    _createSmallCubes.call(this);
    _setListeners.call(this);
  }

  GameBoard.prototype = Object.create(View.prototype);
  GameBoard.prototype.constructor = GameBoard;

  // set the 2D-3D transition flag
  GameBoard.prototype.setIs2D = function(bool){
    this.is2D = bool;
  };

  // Sets the destroyer position and will transiton that the set position.  It will
  // also set the position of the small cube that was just removed by the destroyer
  // cube
  GameBoard.prototype.setDestroyerPosition = function(pos){
    // convert game board coordinate to pixels
    var posPix = _convertToPixels.call(this,pos);
    this.destroyerCube.setPosition(posPix);
    for (var i = 0; i < this.smallCubes.length; i++){
      var cubePos = this.smallCubes[i].getPosition();
      // Checks for small cube position that matches the new destroyer cube position
      if (cubePos[0] === posPix[0] && cubePos[1] === posPix[1] && cubePos[2] === posPix[2]){
        // remove the cube by setting it far far away
        this.smallCubes[i].setPosition( _convertToPixels.call(this, [-10000,-10000,0]));
      }
    }
  };

  GameBoard.DEFAULT_OPTIONS = {
    mainCubeSize: 400,
    destroyer: undefined,
    destroyerColor: 'blue',
    smallCube: undefined,
    smallCubeColor: 'red'
  };

  // Create the destroyer cube
  function _createDestroyerCube () {
    this.destroyerCube = new DestroyerCube({
      startPosition: _convertToPixels.call(this,this.options.destroyer),
      color: this.options.destroyerColor,
      size: this.options.mainCubeSize/4
    });
    this.node.add(this.destroyerCube);
  }
  
  // Create the the game board/parent cube
  function _createParentCube () {
    this.cube = new CubeView({
      size: this.options.mainCubeSize
    });

    this.node.add(this.cube);
  }

  // Create all the small cubes; location should be passed in at creation
  function _createSmallCubes() {
    this.smallCubes = [];
    for (var i=0; i<this.options.smallCube.length; i++){
      var smallCube = new SmallCube({
        startPosition: _convertToPixels.call(this,this.options.smallCube[i]),
        cubeColor: this.options.smallCubeColor,
        size: this.options.mainCubeSize/4
      });
      this.smallCubes.push(smallCube);
      this.node.add(smallCube);
    }
  }

  // Set event listeners for this view
  function _setListeners() {
    // Listen for 2D-3D transition if 2D pipe event listener to listen for
    // destroyer cube movement
    this._eventInput.on('is2d', function(data){
      if (data){
        this.destroyerCube.pipe(this._eventInput);
      }else{
        this.destroyerCube.unpipe(this._eventInput);
      }
    }.bind(this));

    // Listen for events from destroyer cube on the mouse movement. Upon receiving
    // the event, emit an event to Rotating Logic view
    this._eventInput.on('movingCubeToGB', function(data){
      this._eventOutput.emit('movingCubeToRL', data);
    }.bind(this));
  }

  // Convert game board coordinate to pixels
  function _convertToPixels(array) {
    var output = [
      (array[0]-1.5)*this.options.mainCubeSize/4,
      (array[1]-1.5)*this.options.mainCubeSize/4,
      (array[2]-1.5)*this.options.mainCubeSize/4
    ];
    return output;
  };

  module.exports = GameBoard;

});

