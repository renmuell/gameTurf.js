/**
 * theatre.js
 *
 * @package gameturfjs
 */

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

  , foregroundCanvas     : undefined
  , foreground           : undefined

  , scale                : 2

  , canvasBoxLeft        : 0
  , canvasBoxTop         : 0
  , canvasBoxRight       : 0
  , canvasBoxBottom      : 0

  , shakeDuration        : 50
  , shakeStartTime       : -1
  , allowScreenShake     : false
  , screenShakeMagnitude : 5

  , useResolutionDivider : false
  , resolutionDivider    : 2
  , movesWithPlayer      : false

  , currentTranslateX    : 0
  , currentTranslateY    : 0

  , worldNeedsRedraw     : true

  , canvasHeight         : window.innerHeight
  , canvasWidth          : window.innerWidth

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

      theatre.foregroundCanvas  = document.getElementById('Foreground')
      theatre.foreground        = theatre.foregroundCanvas.getContext('2d')

      theatre.waterCanvas              = document.getElementById('Water-Container')
      theatre.waterCanvas.style.width  = theatre.canvasWidth  + "px"
      theatre.waterCanvas.style.height = theatre.canvasHeight + "px"

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
      theatre.setSize(theatre.foregroundCanvas)
    }

    /**
     *  
     */ 
  , setSize: function(canvas){

      if (theatre.useResolutionDivider) {

        canvas.className += " scaleCanvas"
        canvas.width      = theatre.canvasWidth / theatre.resolutionDivider
        canvas.height     = theatre.canvasHeight  / theatre.resolutionDivider
        canvas.style.transformOrigin = "0% 0%"
        canvas.style.transform 
          = "scale(" + theatre.resolutionDivider + ", " + theatre.resolutionDivider + ")"

      } else {

        canvas.width  = theatre.canvasWidth
        canvas.height = theatre.canvasHeight

        theatre.canvasBoxLeft   = 0
        theatre.canvasBoxTop    = 0
        theatre.canvasBoxBottom = theatre.canvasHeight
        theatre.canvasBoxRight  = theatre.canvasWidth
      }
    }

    /**
     *  
     */ 
  , setScale: function(){
      theatre.stage.scale(theatre.scale,theatre.scale)
      theatre.grid.scale(theatre.scale,theatre.scale)
      theatre.backdrop.scale(theatre.scale,theatre.scale)
      theatre.foreground.scale(theatre.scale,theatre.scale)
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
        theatre.canvasBoxLeft* theatre.scale
      , theatre.canvasBoxTop* theatre.scale
      , theatre.canvasWidth* theatre.scale
      , theatre.canvasHeight* theatre.scale)
      
      if (theatre.movesWithPlayer) {

        theatre.backdrop.clearRect(
          theatre.canvasBoxLeft* theatre.scale
        , theatre.canvasBoxTop* theatre.scale
        ,  theatre.canvasWidth* theatre.scale
        , theatre.canvasHeight* theatre.scale)

        theatre.foreground.clearRect(
          theatre.canvasBoxLeft* theatre.scale
        , theatre.canvasBoxTop* theatre.scale
        ,  theatre.canvasWidth* theatre.scale
        , theatre.canvasHeight* theatre.scale)

        //theatre.stage.restore()
        //theatre.backdrop.restore()
      }
    }

    /**
     *  
     */ 
  , clearWorld: function(){
      theatre.backdrop.clearRect(
        theatre.canvasBoxLeft* theatre.scale
      , theatre.canvasBoxTop* theatre.scale
      , theatre.canvasBoxRight* theatre.scale
      , theatre.canvasBoxBottom* theatre.scale)

      theatre.foreground.clearRect(
        theatre.canvasBoxLeft* theatre.scale
      , theatre.canvasBoxTop* theatre.scale
      , theatre.canvasBoxRight* theatre.scale
      , theatre.canvasBoxBottom* theatre.scale)
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
        theatre.foreground.save()

        var dx = (Math.random() * theatre.screenShakeMagnitude) * theatre.scale
        var dy = (Math.random() * theatre.screenShakeMagnitude) * theatre.scale
        theatre.stage.translate(dx, dy)
        theatre.backdrop.translate(dx, dy)
        theatre.foreground.translate(dx, dy)
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
        theatre.foreground.restore()
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

        var widthHalf  = theatre.canvasWidth / 2;
        var heightHalf = theatre.canvasHeight / 2;
   
        var playerX = physics.position.x * theatre.scale;
        var playerY = physics.position.y * theatre.scale;

        var posX = playerX - widthHalf;
        var posY = playerY - heightHalf;

        theatre.stage.setTransform(1, 0, 0, 1, posX*-1, posY*-1);
        theatre.backdrop.setTransform(1, 0, 0, 1, posX*-1, posY*-1);
        theatre.foreground.setTransform(1, 0, 0, 1, posX*-1, posY*-1);

        theatre.canvasBoxLeft   = physics.position.x - (widthHalf/theatre.scale);
        theatre.canvasBoxRight  = physics.position.x + (widthHalf/theatre.scale);
        theatre.canvasBoxTop    = physics.position.y - (heightHalf/theatre.scale);
        theatre.canvasBoxBottom = physics.position.y + (heightHalf/theatre.scale);
        
        theatre.worldNeedsRedraw = true;
      
      } else {

        if ((physics.position.x * theatre.scale) < theatre.canvasBoxLeft) {
          
          theatre.currentTranslateX  += theatre.canvasWidth
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.foreground.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxLeft   -= theatre.canvasWidth
          theatre.canvasBoxRight  -= theatre.canvasWidth
          theatre.worldNeedsRedraw = true
          // translate left
        
        } else if ((physics.position.x * theatre.scale) > theatre.canvasBoxRight){
          
          // translate right
          theatre.currentTranslateX  -= theatre.canvasWidth
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.foreground.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxLeft   += theatre.canvasWidth
          theatre.canvasBoxRight  += theatre.canvasWidth
          theatre.worldNeedsRedraw = true

        } else if ((physics.position.y * theatre.scale) < theatre.canvasBoxTop){
          
          // translate top
          theatre.currentTranslateY  += theatre.canvasHeight
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.foreground.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxTop    -= theatre.canvasHeight
          theatre.canvasBoxBottom -= theatre.canvasHeight
          theatre.worldNeedsRedraw = true

        } else if ((physics.position.y * theatre.scale) > theatre.canvasBoxBottom){
          
          // translate bottom
          theatre.currentTranslateY  -= theatre.canvasHeight
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.foreground.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
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

      gap *= theatre.scale

      var width  = theatre.gridCanvas.width * theatre.scale
      var height = theatre.gridCanvas.height * theatre.scale

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
      theatre.grid.lineWidth   = lineWidth * theatre.scale
      theatre.grid.stroke()
    }

    /**
     *  
     */ 
  , drawTriangleFromCenter: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            (physics.position.x + physics.halfWidth)
          , (physics.position.x - physics.halfWidth) 
          , (physics.position.y - physics.halfHeight) 
          , (physics.position.y + physics.halfHeight))){
        return;
      }

      theatre[canvas].beginPath()
      theatre[canvas].moveTo(
        Math.floor(physics.position.x) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale)
      theatre[canvas].lineTo(
        Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight) * theatre.scale)
      theatre[canvas].lineTo(
        Math.floor(physics.position.x + physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight) * theatre.scale)
      theatre[canvas].lineTo(
        Math.floor(physics.position.x) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale)

      theatre[canvas].fillStyle = color
      theatre[canvas].fill()
    }
  
    /**
     *  
     */ 
  , drawTriangleFromCenterUpsideDown: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            (physics.position.x + physics.halfWidth) 
          , (physics.position.x - physics.halfWidth) 
          , (physics.position.y - physics.halfHeight) 
          , (physics.position.y + physics.halfHeight))){
        return;
      }

      theatre[canvas].beginPath()

      theatre[canvas].moveTo(
        Math.floor(physics.position.x) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight) * theatre.scale)
      theatre[canvas].lineTo(
        Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale)
      theatre[canvas].lineTo(
        Math.floor(physics.position.x + physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale)
      theatre[canvas].lineTo(
        Math.floor(physics.position.x) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight) * theatre.scale)

      theatre[canvas].fillStyle = color
      theatre[canvas].fill()
    }
  
    /**
     *  
     */ 
  , drawSquareFromCenter: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            (physics.position.x + physics.halfWidth) 
          , (physics.position.x - physics.halfWidth) 
          , (physics.position.y - physics.halfHeight) 
          , (physics.position.y + physics.halfHeight))){
        return;
      }

      theatre[canvas].fillStyle = color
      theatre[canvas].fillRect(
        Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale
      , physics.width * theatre.scale
      , physics.height * theatre.scale)
    }
  
    /**
     *  
     */ 
    , drawCurvedSquareFromCenter: function(canvas, physics, color, offset){

      if (theatre.isOutsideOfCanvas(
            (physics.position.x + physics.halfWidth) 
          , (physics.position.x - physics.halfWidth) 
          , (physics.position.y - physics.halfHeight) 
          , (physics.position.y + physics.halfHeight))){
        return;
      }

      theatre[canvas].fillStyle = color

      theatre[canvas].beginPath()
      theatre[canvas].moveTo(
        Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale
      )
      theatre[canvas].quadraticCurveTo(
        physics.position.x * theatre.scale
      , Math.floor(physics.position.y - physics.halfWidth - offset) * theatre.scale
      , Math.floor(physics.position.x + physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale);

      theatre[canvas].quadraticCurveTo(
        Math.floor(physics.position.x + physics.halfWidth + offset) * theatre.scale
      , physics.position.y * theatre.scale
      , Math.floor(physics.position.x + physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight) * theatre.scale);

      theatre[canvas].quadraticCurveTo(
        physics.position.x * theatre.scale
      , Math.floor(physics.position.y + physics.halfWidth + offset) * theatre.scale
      , Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight) * theatre.scale);

      theatre[canvas].quadraticCurveTo(
        Math.floor(physics.position.x - physics.halfWidth - offset) * theatre.scale
      , physics.position.y * theatre.scale
      , Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale);

      theatre[canvas].fill() 
    }

    /**
     *  
     */ 
    , drawBezierCurvedSquareFromCenter: function(canvas, physics, color, offset, divider){

      if (theatre.isOutsideOfCanvas(
            (physics.position.x + physics.halfWidth) 
          , (physics.position.x - physics.halfWidth) 
          , (physics.position.y - physics.halfHeight) 
          , (physics.position.y + physics.halfHeight))){
        return;
      }

      theatre[canvas].fillStyle = color

      theatre[canvas].beginPath()
      theatre[canvas].moveTo(
        Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale
      )
      theatre[canvas].bezierCurveTo(
        Math.floor(physics.position.x - (physics.halfWidth/divider)) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight - offset) * theatre.scale

      , Math.floor(physics.position.x + (physics.halfWidth/divider)) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight - offset) * theatre.scale

      , Math.floor(physics.position.x + physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale);

      theatre[canvas].bezierCurveTo(
        Math.floor(physics.position.x + physics.halfWidth + offset) * theatre.scale
      , Math.floor(physics.position.y - (physics.halfHeight/divider)) * theatre.scale

      , Math.floor(physics.position.x + physics.halfWidth + offset) * theatre.scale
      , Math.floor(physics.position.y + (physics.halfHeight/divider)) * theatre.scale

      , Math.floor(physics.position.x + physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight) * theatre.scale);

      theatre[canvas].bezierCurveTo(
        Math.floor(physics.position.x + (physics.halfWidth/divider)) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight + offset) * theatre.scale
    
      , Math.floor(physics.position.x - (physics.halfWidth/divider)) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight + offset) * theatre.scale

      , Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y + physics.halfHeight) * theatre.scale);

      theatre[canvas].bezierCurveTo(
        Math.floor(physics.position.x - physics.halfWidth - offset) * theatre.scale
      , Math.floor(physics.position.y + (physics.halfHeight/divider)) * theatre.scale

      , Math.floor(physics.position.x - physics.halfWidth - offset) * theatre.scale
      , Math.floor(physics.position.y - (physics.halfHeight/divider)) * theatre.scale

      , Math.floor(physics.position.x - physics.halfWidth) * theatre.scale
      , Math.floor(physics.position.y - physics.halfHeight) * theatre.scale);

      theatre[canvas].fill() 
    }
    /**
     *  
     */ 
  , drawSquareFromLeftTopCorner: function(canvas, position, size, color){

      if (theatre.isOutsideOfCanvas(
            (position.x + size) 
          , position.x 
          , position.y 
          , (position.y + size) )){
        return;
      }

      theatre[canvas].fillStyle = color
      theatre[canvas].fillRect(
        Math.floor(position.x) * theatre.scale
      , Math.floor(position.y) * theatre.scale
      , size * theatre.scale
      , size * theatre.scale)
    }
  
    /**
     *  
     */ 
  , drawCircle: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            (physics.position.x + physics.halfWidth)
          , (physics.position.x - physics.halfWidth) 
          , (physics.position.y - physics.halfHeight) 
          , (physics.position.y + physics.halfHeight))){
        return;
      }

      theatre[canvas].beginPath()
      theatre[canvas].arc(
        Math.floor(physics.position.x) * theatre.scale
      , Math.floor(physics.position.y) * theatre.scale
      , physics.halfWidth * theatre.scale
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
      theatre[canvas].lineWidth = 1 * theatre.scale
      theatre[canvas].moveTo(
        Math.floor(position.x) * theatre.scale
      , Math.floor(position.y) * theatre.scale)
      theatre[canvas].lineTo(
        Math.floor(position.x + width) * theatre.scale
      , Math.floor(position.y) * theatre.scale)
      theatre[canvas].stroke()
    }
  
    /**
     *  
     */ 
  , drawLineWithVector: function(canvas, physics, vector, color){
        theatre[canvas].beginPath()
        theatre[canvas].strokeStyle = color
        theatre[canvas].lineWidth   = 1 * theatre.scale
        theatre[canvas].moveTo(
          Math.floor(physics.position.x) * theatre.scale
        , Math.floor(physics.position.y) * theatre.scale)
        theatre[canvas].lineTo(
          Math.floor(physics.position.x + vector.x) * theatre.scale
        , Math.floor(physics.position.y + vector.y) * theatre.scale)
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
        theatre[canvas].lineWidth   = Math.floor(lineWidth) * theatre.scale

        theatre[canvas].moveTo(
          Math.floor(positionForLine.x) * theatre.scale
        , Math.floor(positionForLine.y) * theatre.scale)

        for (var i = 0, positionIndex = startIndex; i < maxLength; i++) {
          positionForLine = linePositions[positionIndex]

          if (positionForLine == undefined){
            continue
          }

          theatre[canvas].lineTo(
            Math.floor(positionForLine.x) * theatre.scale
          , Math.floor(positionForLine.y) * theatre.scale)

          positionIndex = (positionIndex + 1) % maxLength
        }

        if (physics){
          theatre[canvas].lineTo(
            Math.floor(physics.position.x) * theatre.scale
          , Math.floor(physics.position.y) * theatre.scale)
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
          Math.floor(lines[i].lineStartX) * theatre.scale
        , Math.floor(lines[i].lineStartY) * theatre.scale)

        theatre[canvas].lineTo(
          Math.floor(lines[i].lineEndX) * theatre.scale
        , Math.floor(lines[i].lineEndY) * theatre.scale)
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
     *  This will adjust the position on the canvas to the position of
     *  the game stage coordinates. 
     *
     *  @param position {object}   - the position on the canvas
     *  {
     *      x {number}  - x position on canvas 0 - 400
     *    , y {number}  - y position on canvas 0 - 400
     *  }
     */
  , adjustPositionToStage: function(position){
      position.x = (theatre.canvasBoxLeft + (position.x/theatre.scale))
      position.y = (theatre.canvasBoxTop + (position.y/theatre.scale)) 
      return position;
  } 
}

if (ui.datGui) {
  var datGuiFolder = ui.datGui.addFolder("theatre")
  datGuiFolder.add(theatre, "canvasBoxLeft").listen();   
  datGuiFolder.add(theatre, "canvasBoxTop").listen();            
  datGuiFolder.add(theatre, "canvasBoxRight").listen();          
  datGuiFolder.add(theatre, "canvasBoxBottom").listen();         
  datGuiFolder.add(theatre, "useResolutionDivider")
  datGuiFolder.add(theatre, "resolutionDivider").listen();       
  datGuiFolder.add(theatre, "movesWithPlayer").listen(); 
  datGuiFolder.add(theatre, "currentTranslateX").listen();       
  datGuiFolder.add(theatre, "currentTranslateY").listen();       
  datGuiFolder.add(theatre, "worldNeedsRedraw").listen();        
  datGuiFolder.add(theatre, "canvasHeight").listen();            
  datGuiFolder.add(theatre, "canvasWidth").listen();       
  datGuiFolder.add(theatre, "allowScreenShake")
  datGuiFolder.add(theatre, "screenShakeMagnitude")
  datGuiFolder.add(theatre, "shakeDuration")
  datGuiFolder.add(theatre, "startShake")
  datGuiFolder.add(theatre, "drawGrids")
  datGuiFolder.add(theatre, "clearGrid")
  datGuiFolder.add(theatre, "scale")
  datGuiFolder.add(theatre, "setScale")
}

module.exports = theatre

}());
