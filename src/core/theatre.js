/******************************************************************************
 * theatre.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var ui = require('./ui')

/**
 *  
 */ 
var theatre = {

    stageCanvas          : undefined
  , stage                : undefined

  , gridCanvas           : undefined
  , grid                 : undefined

  , backdropCanvas       : undefined
  , backdrop             : undefined

  , scale                : 4

  , canvasBoxLeft        : 0
  , canvasBoxTop         : 0
  , canvasBoxRight       : 0
  , canvasBoxBottom      : 0

  , shakeDuration        : 50
  , shakeStartTime       : -1
  , allowScreenShake     : false
  , scrrenShakeMagnitude : 5

  , useResolutionDevider : false
  , resolutionDevider    : 2
  , movesWithPlayer      : false

  , currentTranslateX    : 0
  , currentTranslateY    : 0

  , worldNeedsRedraw     : true

    , canvasHeight         : window.innerHeight
    , canvasWidth          : window.innerWidth

  //, canvasHeight         : 400
  //, canvasWidth          : 400

    /**
     *  
     */ 
  , init: function(movesWithPlayer){

      theatre.movesWithPlayer = movesWithPlayer

      theatre.stageCanvas     = document.getElementById('Stage')
      theatre.stage           = theatre.stageCanvas.getContext('2d')

      theatre.gridCanvas      = document.getElementById('Grid')
      theatre.grid            = theatre.gridCanvas.getContext('2d')

      theatre.backdropCanvas  = document.getElementById('Backdrop')
      theatre.backdrop        = theatre.backdropCanvas.getContext('2d')

      theatre.waterCanvas              = document.getElementById('Water-Container')
      theatre.waterCanvas.style.width  = theatre.canvasWidth  + "px"
      theatre.waterCanvas.style.height = theatre.canvasHeight + "px"

      theatre.waterCanvas
      theatre.resize()
      
      window.addEventListener('resize', theatre.resize, false)
    }

    /**
     *  
     */ 
  , resize: function(){
      theatre.setSize(theatre.stageCanvas)
      theatre.setSize(theatre.gridCanvas)
      theatre.setSize(theatre.backdropCanvas)
    }

    /**
     *  
     */ 
  , setSize: function(canvas){

      if (theatre.useResolutionDevider) {

        canvas.className += " scaleCanvas"
        canvas.width      = theatre.canvasWidth  / theatre.resolutionDevider
        canvas.height     = theatre.canvasHeight / theatre.resolutionDevider
        canvas.style.transformOrigin = "0% 0%"
        canvas.style.transform 
          = "scale(" + theatre.resolutionDevider + ", " + theatre.resolutionDevider + ")"

      } else {

        canvas.width  = theatre.canvasWidth
        canvas.height = theatre.canvasHeight

        theatre.canvasBoxLeft   = 0
        theatre.canvasBoxTop    = 0
        theatre.canvasBoxBottom = canvas.height
        theatre.canvasBoxRight  = canvas.width
      }
    }

    /**
     *  
     */ 
  , setScale: function(){
      theatre.stage.scale(theatre.scale,theatre.scale)
      theatre.grid.scale(theatre.scale,theatre.scale)
      theatre.backdrop.scale(theatre.scale,theatre.scale)
    }

    /**
     *  
     */ 
  , clearStage: function(){

      if (theatre.movesWithPlayer) {
        //theatre.stage.save()
        //theatre.backdrop.save()

        //theatre.stage.setTransform(1,0,0,1,0,0)
        //theatre.backdrop.setTransform(1,0,0,1,0,0)
      }

      theatre.stage.clearRect(
        theatre.canvasBoxLeft
      , theatre.canvasBoxTop
      , theatre.canvasBoxRight  - theatre.canvasBoxLeft
      , theatre.canvasBoxBottom - theatre.canvasBoxTop)
      
      if (theatre.movesWithPlayer) {

        theatre.backdrop.clearRect(
          theatre.canvasBoxLeft
        , theatre.canvasBoxTop
        , theatre.canvasBoxRight  - theatre.canvasBoxLeft
        , theatre.canvasBoxBottom - theatre.canvasBoxTop)

        //theatre.stage.restore()
        //theatre.backdrop.restore()
      }
    }

    /**
     *  
     */ 
  , clearWorld: function(){
      theatre.backdrop.clearRect(
        theatre.canvasBoxLeft
      , theatre.canvasBoxTop
      , theatre.canvasBoxRight
      , theatre.canvasBoxBottom)
    }

    /**
     *  
     */ 
  , clearGrid: function(){
      theatre.grid.clearRect(
        0
      , 0
      , theatre.gridCanvas.width
      , theatre.gridCanvas.height)
    }

    /**
     *  
     */ 
  , drawGrids: function() {
      theatre.clearGrid()
      theatre.drawGrid(0.5, 10, "gray")
      theatre.drawGrid(1, 100, "black")
    }

    /**
     *  
     */ 
  , preShake: function () {
      if (theatre.allowScreenShake) {
        if (theatre.shakeStartTime == -1) {
          return;
        }

        var dt = Date.now() - theatre.shakeStartTime

        if (dt > theatre.shakeDuration) {
            theatre.shakeStartTime = -1
            return;
        }

        theatre.stage.save()
        theatre.backdrop.save()

        var dx = Math.random() * theatre.scrrenShakeMagnitude
        var dy = Math.random() * theatre.scrrenShakeMagnitude
        theatre.stage.translate(dx, dy)
        theatre.backdrop.translate(dx, dy)
      }
    }

    /**
     *  
     */ 
  , postShake: function() {
      if(theatre.allowScreenShake) {
        if (theatre.shakeStartTime ==-1) {
          return;
        }
        theatre.stage.restore()
        theatre.backdrop.restore()
      }
    }

    /**
     *  
     */ 
  , startShake: function () {
      if (theatre.allowScreenShake) {
        theatre.shakeStartTime = Date.now()
      }
    }

    /**
     *  
     */ 
  , playerUpdate: function(physics){
      if (theatre.movesWithPlayer){

        var posX = (theatre.stageCanvas.width  / 2) - physics.x
        var posY = (theatre.stageCanvas.height / 2) - physics.y

        theatre.stage.setTransform(1, 0, 0, 1, posX, posY)
        theatre.backdrop.setTransform(1, 0, 0, 1, posX, posY)

        theatre.canvasBoxLeft   = physics.x - (theatre.stageCanvas.width  / 2)
        theatre.canvasBoxRight  = physics.x + (theatre.stageCanvas.width  / 2)
        theatre.canvasBoxTop    = physics.y - (theatre.stageCanvas.height / 2)
        theatre.canvasBoxBottom = physics.y + (theatre.stageCanvas.height / 2)

        theatre.worldNeedsRedraw = true
      
      } else {

        if (physics.x < theatre.canvasBoxLeft) {
          
          theatre.currentTranslateX  += theatre.canvasWidth
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxLeft   -= theatre.canvasWidth
          theatre.canvasBoxRight  -= theatre.canvasWidth
          theatre.worldNeedsRedraw = true
          // translate left
        
        } else if (physics.x > theatre.canvasBoxRight){
          
          // translate right
          theatre.currentTranslateX  -= theatre.canvasWidth
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxLeft   += theatre.canvasWidth
          theatre.canvasBoxRight  += theatre.canvasWidth
          theatre.worldNeedsRedraw = true

        } else if (physics.y < theatre.canvasBoxTop){
          
          // translate top
          theatre.currentTranslateY  += theatre.canvasHeight
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxTop    -= theatre.canvasHeight
          theatre.canvasBoxBottom -= theatre.canvasHeight
          theatre.worldNeedsRedraw = true

        } else if (physics.y > theatre.canvasBoxBottom){
          
          // translate bottom
          theatre.currentTranslateY  -= theatre.canvasHeight
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxTop    += theatre.canvasHeight
          theatre.canvasBoxBottom += theatre.canvasHeight
          theatre.worldNeedsRedraw = true
        }
      }
    }

    /**
     *  
     */ 
  , drawGrid: function(lineWidth, gap, color){

      var width  = theatre.gridCanvas.width
      var height = theatre.gridCanvas.height

      theatre.grid.beginPath()

      for (var x = 0; x <= width; x += gap) {
          theatre.grid.moveTo(x, 0)
          theatre.grid.lineTo(x, height)
      }

      for (var y = 0; y <= height;  y += gap) {
          theatre.grid.moveTo(0, y)
          theatre.grid.lineTo(width, y)
      }

      theatre.grid.strokeStyle = color
      theatre.grid.lineWidth   = lineWidth
      theatre.grid.stroke()
    }

    /**
     *  
     */ 
  , drawTrianlgeFromCenter: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            physics.x + physics.halfWidth
          , physics.x - physics.halfWidth
          , physics.y - physics.halfHeight
          , physics.y + physics.halfHeight)){
        return;
      }

      theatre[canvas].beginPath()
      theatre[canvas].moveTo(
        Math.floor(physics.x)
      , Math.floor(physics.y - physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.x - physics.halfWidth)
      , Math.floor(physics.y + physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.x + physics.halfWidth)
      , Math.floor(physics.y + physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.x)
      , Math.floor(physics.y - physics.halfHeight))

      theatre[canvas].fillStyle = color
      theatre[canvas].fill()
    }
  
    /**
     *  
     */ 
  , drawTrianlgeFromCenterUpsideDown: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            physics.x + physics.halfWidth
          , physics.x - physics.halfWidth
          , physics.y - physics.halfHeight
          , physics.y + physics.halfHeight)){
        return;
      }

      theatre[canvas].beginPath()

      theatre[canvas].moveTo(
        Math.floor(physics.x)
      , Math.floor(physics.y + physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.x - physics.halfWidth)
      , Math.floor(physics.y - physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.x + physics.halfWidth)
      , Math.floor(physics.y - physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.x)
      , Math.floor(physics.y + physics.halfHeight))

      theatre[canvas].fillStyle = color
      theatre[canvas].fill()
    }
  
    /**
     *  
     */ 
  , drawSquareFromCenter: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            physics.x + physics.halfWidth
          , physics.x - physics.halfWidth
          , physics.y - physics.halfHeight
          , physics.y + physics.halfHeight)){
        return;
      }

      theatre[canvas].fillStyle = color
      theatre[canvas].fillRect(
        Math.floor(physics.x - physics.halfWidth)
      , Math.floor(physics.y - physics.halfHeight)
      , physics.width
      , physics.height)
    }
  
    /**
     *  
     */ 
  , drawSquareFromLeftTopCorner: function(canvas, position, size, color){

      if (theatre.isOutsideOfCanvas(
            position.x + size
          , position.x
          , position.y
          , position.y + size)){
        return;
      }

      theatre[canvas].fillStyle = color
      theatre[canvas].fillRect(
        Math.floor(position.x)
      , Math.floor(position.y)
      , size
      , size)
    }
  
    /**
     *  
     */ 
  , drawCircle: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            physics.x + physics.halfWidth
          , physics.x - physics.halfWidth
          , physics.y - physics.halfHeight
          , physics.y + physics.halfHeight)){
        return;
      }

      theatre[canvas].beginPath()
      theatre[canvas].arc(
        Math.floor(physics.x)
      , Math.floor(physics.y)
      , physics.halfWidth
      , 0
      , 2 * Math.PI
      , false)

      theatre[canvas].fillStyle = color
      theatre[canvas].fill()
    }
  
    /**
     *  
     */ 
  , drawLine: function(canvas, position, width, color){
      theatre[canvas].beginPath()
      theatre[canvas].strokeStyle = color
      theatre[canvas].lineWidth   = 1
      theatre[canvas].moveTo(
        Math.floor(position.x)
      , Math.floor(position.y))
      theatre[canvas].lineTo(
        Math.floor(position.x + width)
      , Math.floor(position.y))
      theatre[canvas].stroke()
    }
  
    /**
     *  
     */ 
  , drawLineWithVector: function(canvas, physics, vector, color){
        theatre[canvas].beginPath()
        theatre[canvas].strokeStyle = color
        theatre[canvas].lineWidth   = 1
        theatre[canvas].moveTo(
          Math.floor(physics.x)
        , Math.floor(physics.y))
        theatre[canvas].lineTo(
          Math.floor(physics.x + vector.x)
        , Math.floor(physics.y + vector.y))
        theatre[canvas].stroke()
    }
  
    /**
     *  
     */ 
  , drawPath: function(canvas, linePositions, startIndex, color, lineWidth, maxLength, physics){

      var positionForLine = linePositions[startIndex]

      if (positionForLine != undefined) {

        theatre[canvas].beginPath()
        theatre[canvas].strokeStyle = color
        theatre[canvas].lineWidth   = Math.floor(lineWidth)

        theatre[canvas].moveTo(
          Math.floor(positionForLine.x)
        , Math.floor(positionForLine.y))

        for (var i = 0, positionIndex = startIndex; i < maxLength; i++) {
          positionForLine = linePositions[positionIndex]

          if (positionForLine == undefined){
            continue
          }

          theatre[canvas].lineTo(
            Math.floor(positionForLine.x)
          , Math.floor(positionForLine.y))

          positionIndex = (positionIndex + 1) % maxLength
        }

        if (physics){
          theatre[canvas].lineTo(
            Math.floor(physics.x)
          , Math.floor(physics.y))
        }

        theatre[canvas].stroke()
      }
    }
  
    /**
     *  
     */ 
  , drawMultipleLines: function(canvas, lines, color){
      theatre[canvas].beginPath()
      theatre[canvas].strokeStyle = color

      for (var i = lines.length - 1; i >= 0; i--) {

        theatre[canvas].moveTo(
          Math.floor(lines[i].lineStartX)
        , Math.floor(lines[i].lineStartY))

        theatre[canvas].lineTo(
          Math.floor(lines[i].lineEndX)
        , Math.floor(lines[i].lineEndY))
      }

      theatre[canvas].stroke()
    }
  
    /**
     *  
     */ 
  , isOutsideOfCanvas: function(right, left, top, bottom){
      return !(theatre.canvasBoxLeft   < right
            && theatre.canvasBoxRight  > left
            && theatre.canvasBoxTop    < bottom
            && theatre.canvasBoxBottom > top)
    }

    /**
     *  This will adjust the postion on the canvas to the position of
     *  the game stage cordinates. 
     *
     *  @param position {object}   - the position on the canvas
     *  {
     *      x {nubmer}  - x position on canvas 0 - 400
     *    , y {nubmer}  - y position on canvas 0 - 400
     *  }
     */
  , adjustPositionToStage: function(position){
      position.x = theatre.canvasBoxLeft + position.x
      position.y = theatre.canvasBoxTop  + position.y
  } 
}

if (ui.datGui) {
  var datGuiFolder = ui.datGui.addFolder("theatre")
  datGuiFolder.add(theatre, "allowScreenShake")
  datGuiFolder.add(theatre, "scrrenShakeMagnitude")
  datGuiFolder.add(theatre, "shakeDuration")
  datGuiFolder.add(theatre, "startShake")
  datGuiFolder.add(theatre, "drawGrids")
  datGuiFolder.add(theatre, "clearGrid")
  datGuiFolder.add(theatre, "scale")
  datGuiFolder.add(theatre, "setScale")
}

module.exports = theatre

}());
