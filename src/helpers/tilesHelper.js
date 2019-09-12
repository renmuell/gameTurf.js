
/******************************************************************************
 * tilesHelper.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var theatre   = require('./../core/theatre')
var settings  = require('./../core/settings')

var tileHelper = {

    tileWalls: []
  , createdTime   : Date.now()
  , grassHalmPositions: []
  , neahrestTileWalls: []
  , offscreenCanvas: []
  , currentDialation: 0

  , init: function(){

  }

  , createOffscreenCanvas: function (id) {

    var canvasElement    = document.createElement('canvas')
    canvasElement.height = settings.tileSize * theatre.scale
    canvasElement.width  = settings.tileSize * theatre.scale
    var canvas           = canvasElement.getContext('2d')
    canvas.height        = settings.tileSize * theatre.scale
    canvas.width         = settings.tileSize * theatre.scale

    tileHelper.offscreenCanvas[id] = {
      canvas: canvas,
      canvasElement: canvasElement
    }

  }

    /**
     * Bedeutung:
     *  
     * 1 = 0001 --> setzte 2^0 stelle -> oben ist keine wand
     * 2 = 0010 --> setzte 2^1 stelle -> rechts ist keine wand
     * 4 = 0100 --> setzte 2^2 stelle -> unten ist keine wand
     * 8 = 1000 --> setzte 2^3 stelle -> links ist keine wand
     *
     * (2^3, 2^2, 2^1, 2^0) --> (links, unten, rechts, oben)
     *
     * Wandarten:
     *
     *  0 -> 0000 -> links, unten, rechts, oben Wand
     *  1 -> 0001 -> links, unten, rechts Wand
     *  2 -> 0010 -> links, unten, oben Wand
     *  3 -> 0011 -> links, unten  Wand
     *  4 -> 0100 -> links, rechts, oben Wand
     *  5 -> 0101 -> links, rechts Wand
     *  6 -> 0110 -> links, oben Wand
     *  7 -> 0111 -> links Wand
     *  8 -> 1000 -> unten, rechts, oben Wand
     *  9 -> 1001 -> unten, rechts Wand
     * 10 -> 1010 -> unten, oben Wand
     * 11 -> 1011 -> unten Wand
     * 12 -> 1100 -> rechts, oben Wand
     * 13 -> 1101 -> rechts Wand
     * 14 -> 1110 -> oben Wand
     * 15 -> 1111 -> keine Wand
     *
     * Danach addieren wir 1 drauf, somit wird Tiletypes:
     *
     * 0: keine Player/Map Zone
     * 1: links, unten, rechts, oben Wand
     * 2: links, unten, rechts Wand
     * 
     *  ...
     *
     * 16: keine Wand
     *
     */
  , calculateMapWithTileTypes: function(map, worldWith, wolrdHeight){
      var mapWithTileTypes = []

      for (var y = 0; y < wolrdHeight; y++) {
        for (var x = 0; x < worldWith; x++) {

          var arrayPosition = y * worldWith + x

          if (map[arrayPosition] != 0) {

            var val = 0

            // oben ist keine wand
            if (y > 0 && map[(y - 1) * worldWith + x] != 0) {
              val |= 1
            }

            // rechts ist keine wand
            if (x < (worldWith-1) && map[y * worldWith + x + 1] != 0) {
              val |= 2
            }

            // unten ist keine wand
            if (y < (wolrdHeight-1) && map[(y + 1) * worldWith + x] != 0){
                val |= 4
            }

            // links ist keine wand
            if (x > 0 && map[y * worldWith + x - 1] != 0) {
              val |= 8
            }

            mapWithTileTypes[arrayPosition] = val + 1

          } else {
            mapWithTileTypes[arrayPosition] = 0
          }
        }
      }

      return mapWithTileTypes
    }

    /**
     * example:
     *  1001 && 0001 -> 0001 -> 1 -> oben keine Wand
     *  1001 && 0010 -> 0000 -> 0 -> rechts ist Wand
     *  1001 && 0100 -> 0000 -> 0 -> unten ist Wand
     *  1001 && 1001 -> 1000 -> 8 -> links keine Wand
     * 
     * (links, unten, rechts, oben)
     */
  , calculateNeahrestTileWalls: function(mapWithTileTypes, worldWith, wolrdHeight, position){

      var arrayPosition      = 0
        , tileArrayPositionX = Math.floor(Math.floor(position.x)/settings.tileSize)
        , tileArrayPositionY = Math.floor(Math.floor(position.y)/settings.tileSize)

      for (var x = tileArrayPositionX - 1; x <= (tileArrayPositionX + 1); x++) {
        for (var y = tileArrayPositionY - 1; y <= (tileArrayPositionY + 1); y++) {

          if (x<0 || y<0 || x>=worldWith||y >= wolrdHeight){
              tileHelper.neahrestTileWalls[arrayPosition++] = undefined
            } else {
            tileHelper.neahrestTileWalls[arrayPosition++] = tileHelper.addTileWalls(
              mapWithTileTypes
            , x
            , y
            , worldWith)
            }
        }
      }
    }

  , addTileWalls: function(
      mapWithTileTypes
    , tileArrayPositionX
    , tileArrayPositionY
    , worldWith){

      if (tileHelper.tileWalls[tileArrayPositionY * worldWith + tileArrayPositionX] == undefined) {
        
        var wallType = mapWithTileTypes[tileArrayPositionY * worldWith + tileArrayPositionX] - 1
          , walls    = []

          , tileLeftTopPosition = {
              x: tileArrayPositionX * settings.tileSize
            , y: tileArrayPositionY * settings.tileSize
          }
          , tileRightTopPosition = {
              x: tileLeftTopPosition.x + settings.tileSize
            , y: tileLeftTopPosition.y
          }
          , tileRightBottomPosition = {
              x: tileLeftTopPosition.x + settings.tileSize
            , y: tileLeftTopPosition.y + settings.tileSize
          }

          , tileLeftBottomosition = {
              x: tileLeftTopPosition.x
            , y: tileLeftTopPosition.y + settings.tileSize
          }

        // oben ist wand
        if ((wallType & 1) === 0) {
          walls.push([tileLeftTopPosition, tileRightTopPosition])
        }

        // rechts ist wand
        if ((wallType & 2) === 0) {
          walls.push([tileRightTopPosition, tileRightBottomPosition])
        }

        // unten ist wand
        if ((wallType & 4) === 0) {
          walls.push([tileLeftBottomosition, tileRightBottomPosition])
        }

        // links ist wand
        if ((wallType & 8) === 0) {
          walls.push([tileLeftTopPosition, tileLeftBottomosition])
        }

        tileHelper.tileWalls[tileArrayPositionY * worldWith + tileArrayPositionX] = walls
      }

      return tileHelper.tileWalls[tileArrayPositionY * worldWith + tileArrayPositionX]
    }

  , calculateCurrentDialation: function () {
      //animationSpan
      var timeLength = 5000
      var timeSegments = (Date.now() - tileHelper.createdTime) % timeLength

      // linearNormalizeTimeSegments: -1 to 1 => mapping to smaller range
      var linearNormalizeTimeSegments = timeSegments / timeLength
      linearNormalizeTimeSegments *= 2
      linearNormalizeTimeSegments -= 1
   
      // quadraticNormalizeTimeSegments: 0 to 1 to 0 => ^^^^^^^ => -1 is zero and 1 is zero -> continues loop for animation
      tileHelper.currentDialation = ((-1 * Math.pow(linearNormalizeTimeSegments, 2)) + 1)
  }

  , drawTiles: function(timeElapsed, map, mapWithTileTypes, worldWith, wolrdHeight){

      var mintileArrayPositionX = Math.floor(Math.floor(theatre.canvasBoxLeft)   / settings.tileSize)
        , mintileArrayPositionY = Math.floor(Math.floor(theatre.canvasBoxTop)    / settings.tileSize)

        , maxtileArrayPositionX = Math.floor(Math.floor(theatre.canvasBoxRight)  / settings.tileSize)
        , maxtileArrayPositionY = Math.floor(Math.floor(theatre.canvasBoxBottom) / settings.tileSize)

      if (mintileArrayPositionX < 0 ) mintileArrayPositionX = 0
      if (mintileArrayPositionY < 0 ) mintileArrayPositionY = 0
      if (maxtileArrayPositionX < 0 ) maxtileArrayPositionX = 0
      if (maxtileArrayPositionY < 0 ) maxtileArrayPositionY = 0

      if (mintileArrayPositionX > worldWith   - 1) mintileArrayPositionX = worldWith   - 1
      if (mintileArrayPositionY > wolrdHeight - 1) mintileArrayPositionY = wolrdHeight - 1
      if (maxtileArrayPositionX > worldWith   - 1) maxtileArrayPositionX = worldWith   - 1
      if (maxtileArrayPositionY > wolrdHeight - 1) maxtileArrayPositionY = wolrdHeight - 1

      var tilePosition = {}

      tileHelper.calculateCurrentDialation();
      tileHelper.clearOffscreenCanvas();
      tileHelper.drawOffscreenGrass();

      for (var y = mintileArrayPositionY; y <= maxtileArrayPositionY; y++) {
        for (var x = mintileArrayPositionX; x <= maxtileArrayPositionX; x++) {

          var tiletype = mapWithTileTypes[y * worldWith + x]

          if (tiletype === 0) continue

          var tileWidth      = settings.tileSize
            , tileHeight     = settings.tileSize
          
          tilePosition.x = (x * settings.tileSize)
          tilePosition.y = (y * settings.tileSize)

          var wallType = tiletype - 1;

          theatre.drawSquareFromLeftTopCorner(
            'backdrop'
          , tilePosition
          , settings.tileSize +1
          , '#80bdbf')
          //, "#CCDDAF")


          theatre.drawBezierCurvedSquareFromCenter(
            'backdrop', 
            {
              position: {
                  x: tilePosition.x + (tileWidth/2)
                , y: tilePosition.y + (tileHeight/2)
              },
              width: tileWidth +1,
              height: tileHeight +1,
              halfWidth: (tileWidth+1)/2,
              halfHeight: (tileHeight+1)/2
            }, 
            '#CCDDAF', //'rgba(204, 221, 175,.4)',
            (tileHelper.currentDialation*2) * theatre.scale * -1, 
            (tileWidth/2),
            (wallType & 1) !== 0,
            (wallType & 2) !== 0,
            (wallType & 4) !== 0,
            (wallType & 8) !== 0);

          if (map[y * worldWith + x] === 2) {
            tileHelper.drawGrass(theatre.foreground, tilePosition, tileWidth, tileHeight, 6)
          } else {
            tileHelper.drawGrass(theatre.backdrop, tilePosition, tileWidth, tileHeight, 3)
          }
        }
      }

    }
  
  , drawGrass: function(canvas, position, width, height, grassHeight){
      //theatre.resetCanvasTransformation("foreground")
      //theatre.foreground.putImageData(tileHelper.highGrass, position.x * theatre.scale, position.y * theatre.scale)
      //theatre.setCanvasTransformation("foreground");
      canvas.drawImage(tileHelper.offscreenCanvas[grassHeight].canvasElement, position.x * theatre.scale, position.y * theatre.scale)
    }
  , drawOffscreenGrass: function () {

      var grassTall = 6;
      if (tileHelper.offscreenCanvas[grassTall] === undefined) {
        tileHelper.createOffscreenCanvas(grassTall);
      }
      var grassNormal = 3
      if (tileHelper.offscreenCanvas[grassNormal] === undefined) {
        tileHelper.createOffscreenCanvas(grassNormal);
      }

      tileHelper.drawOffscreenGrassVariation(tileHelper.offscreenCanvas[grassTall].canvas, tileHelper.currentDialation, 50, grassTall);
      tileHelper.drawOffscreenGrassVariation(tileHelper.offscreenCanvas[grassNormal].canvas, tileHelper.currentDialation, 10, grassNormal);
      
      //tileHelper.highGrass = tileHelper.offscreenCanvas.getImageData(0, 0, settings.tileSize * theatre.scale, settings.tileSize * theatre.scale)
      //tileHelper.drawOffscreenGrassVariation(tileHelper.currentDialation, 20, 3)
  }

  , drawOffscreenGrassVariation: function (canvas, quadraticNormalizeTimeSegments, count, grassHeight) {
    
    canvas.beginPath();
    canvas.lineWidth = 1
    canvas.strokeStyle = "rgba(167,191,127,0.6)";

    if (tileHelper.grassHalmPositions[grassHeight]) {
    } else {
      tileHelper.grassHalmPositions[grassHeight] = []
    }

    for (var i = count; i >= 0; i--) {
      var grassHalmPosition;
      if (tileHelper.grassHalmPositions[grassHeight][i]) {
        grassHalmPosition = tileHelper.grassHalmPositions[grassHeight][i]
      } else {
        tileHelper.grassHalmPositions[grassHeight][i] = {
          x: (((Math.random() * (settings.tileSize-grassHeight))+ grassHeight))
        , y: (((Math.random() * (settings.tileSize-grassHeight))+ grassHeight))
        }

        grassHalmPosition = tileHelper.grassHalmPositions[grassHeight][i];
      }

      canvas.moveTo(
        Math.floor(grassHalmPosition.x) * theatre.scale
      , Math.floor(grassHalmPosition.y) * theatre.scale
      )

      canvas.quadraticCurveTo(
        Math.floor(grassHalmPosition.x) * theatre.scale
      , Math.floor(grassHalmPosition.y - (grassHeight/2)) * theatre.scale
      , Math.floor(grassHalmPosition.x + ((grassHeight*quadraticNormalizeTimeSegments)-(grassHeight/2))) * theatre.scale
      , Math.floor(grassHalmPosition.y - grassHeight) * theatre.scale
      )
    }

    canvas.stroke()
    canvas.lineWidth = 1
  }
  , clearOffscreenCanvas: function() {
    tileHelper.offscreenCanvas.forEach(function(canvasObj){
      canvasObj.canvas.clearRect(
        0
      , 0
      , canvasObj.canvasElement.width
      , canvasObj.canvasElement.height)
    })  
  }
}

tileHelper.init()

module.exports = tileHelper

}());
