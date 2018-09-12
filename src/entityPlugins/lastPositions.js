/******************************************************************************
 * lastPosition.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */
  
var theatre = require('./../core/theatre')

module.exports = function(settings){

  settings = settings || {}

  var tempPhysics   = {}
    , lastPositions = {
        positions          : []
      , maxLength          : 5
      , lastTimeSet        : 0
      , setTimeDelay       : settings.setTimeDelay || 50
      , lastEntityIndex    : 0
      , onlyUpdateIfMoving : false
      , lineWidth          : 1
      , shouldDrawLine     : true
      , shouldDrawBodies   : settings.shouldDrawBodies !== undefined ? settings.shouldDrawBodies : true
      , color              : settings.color ||  {
          r: 253
        , g: 244
        , b: 194
        }
        
      , addToDatGuiFolder: function(folder) {

          var lastPositionsFolder = folder.addFolder("LastPositions")

          lastPositionsFolder.add(lastPositions, "maxLength")
          lastPositionsFolder.add(lastPositions, "lastTimeSet").listen()
          lastPositionsFolder.add(lastPositions, "setTimeDelay")
          lastPositionsFolder.add(lastPositions, "lastEntityIndex").listen()
          lastPositionsFolder.add(lastPositions, "onlyUpdateIfMoving")
          lastPositionsFolder.add(lastPositions, "lineWidth")
          lastPositionsFolder.add(lastPositions, "drawLine")
          lastPositionsFolder.add(lastPositions, "drawBodies")
        }

      , clear: function(){
          lastPositions.positions       = []
          lastPositions.lastEntityIndex = 0
          lastPositions.lastTimeSet     = 0
        }

      , update: function(physics){

          if (lastPositions.onlyUpdateIfMoving && !physics.isMoving) {
            return;
          }

          if (Date.now() - lastPositions.lastTimeSet > lastPositions.setTimeDelay){

            if (lastPositions.positions[lastPositions.lastEntityIndex] === undefined) {
              lastPositions.positions[lastPositions.lastEntityIndex] = { x: 0, y:0 }
            }

            lastPositions.positions[lastPositions.lastEntityIndex].x = physics.x
            lastPositions.positions[lastPositions.lastEntityIndex].y = physics.y

            lastPositions.lastEntityIndex = (lastPositions.lastEntityIndex + 1) % lastPositions.maxLength
            lastPositions.lastTimeSet     = Date.now()
          }
        }

      , draw: function(physics){

          if (lastPositions.shouldDrawBodies) {
            lastPositions.drawBodies(physics)
          }

          if (lastPositions.shouldDrawLine) {
            lastPositions.drawLine(physics)
          }
        }

      , drawBodies: function(physics){

          for (var i = 0, positionIndex = lastPositions.lastEntityIndex; i < lastPositions.maxLength; i++) {

            if (lastPositions.positions[positionIndex] == undefined) {
              continue
            }

            tempPhysics.x          = lastPositions.positions[positionIndex].x
            tempPhysics.y          = lastPositions.positions[positionIndex].y
            tempPhysics.halfWidth  = physics.halfWidth
            tempPhysics.halfHeight = physics.halfHeight
            tempPhysics.width      = physics.width
            tempPhysics.height     = physics.height

            theatre.drawSquareFromCenter(
              'stage',
              tempPhysics,
              "rgba(" + lastPositions.color.r + ", " +
                        lastPositions.color.g + ", " +
                        lastPositions.color.b + ", " +
                        (i * (0.5/lastPositions.maxLength)) + 0.1 + ")")

            positionIndex = (positionIndex + 1) % lastPositions.maxLength
          }
        }

      , drawLine: function(physics){
          theatre.drawPath(
            'stage'
          , lastPositions.positions
          , lastPositions.lastEntityIndex
          , "rgba(" + lastPositions.color.r + ", " + 
                      lastPositions.color.g + ", " + 
                      lastPositions.color.b + ", 0.6)"
          , lastPositions.lineWidth
          , lastPositions.maxLength
          , physics)
        }
  }

  return lastPositions
}

}());
