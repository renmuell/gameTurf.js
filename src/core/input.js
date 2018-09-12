/******************************************************************************
 * input.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var theatre = require('./theatre')

/**
 *  
 */ 
var input = {

    /**
     *  
     */ 
    keyPressed            : []

    /**
     *  
     */ 
  , onEscDownCallbacks    : []

    /**
     *  
     */ 
  , onEscUpCallbacks      : []

    /**
     *  
     */ 
  , shiftPressed          : false

    /**
     *  
     */ 
  , movementDirectionData : {
      playerInteraction : false
    , isRunning         : false
    , vector            : {
        x: 0
      , y: 0
    }
  }

    /**
     *  The position the user clicked on the map/stage.
     * 
     *  @public (get)
     *  @type {object} 
     *  {
     *      x {number}   
     *    , y {number}
     *    , new {boolean}
     *  }
     */ 
  , lastClickPosition : {
      new : false
    }

    /**
     *  
     */
  , recordMouseMove: false

    /**
     *  
     */
  , onEscDown: function(callback){
      input.onEscDownCallbacks.push(callback)
    }

    /**
     *  
     */   
  , onEscUp: function(callback){
      input.onEscUpCallbacks.push(callback)
    }

    /**
     *  
     */   
  , init: function(stageCanvas){
      document.addEventListener('keydown', input.keydown)
      document.addEventListener('keyup'  , input.keyup)

      stageCanvas.addEventListener('mousedown', input.stageCanvasMousedownHandler, false)
      stageCanvas.addEventListener('mousemove', input.stageCanvasMousemoveHandler, false)
      stageCanvas.addEventListener('mouseup'  , input.stageCanvasMouseupHandler  , false)
    }

    /**
     *  
     */  
  , keydown: function(event){

      input.keyPressed[event.keyCode] = true
      input.shiftPressed              = event.shiftKey

      if (event.keyCode == 27){
        for (var i = input.onEscDownCallbacks.length - 1; i >= 0; i--) {
          input.onEscDownCallbacks[i].call()
        }
      }
    }

    /**
     *  
     */  
  , keyup: function(event){

      input.keyPressed[event.keyCode] = false
      input.shiftPressed              = event.shiftKey

      if (event.keyCode == 27){
        for (var i = input.onEscUpCallbacks.length - 1; i >= 0; i--) {
          input.onEscUpCallbacks[i].call()
        }
      }
    }

    /**
     *  
     */ 
  , stageCanvasMousedownHandler: function(evt) {
      input.lastClickPosition.x   = evt.offsetX 
      input.lastClickPosition.y   = evt.offsetY
      input.lastClickPosition.new = true
      theatre.adjustPositionToStage(input.lastClickPosition)
      input.recordMouseMove = true
    }

    /**
     *  
     */ 
  , stageCanvasMousemoveHandler: function(evt){
      if (input.recordMouseMove) {
        input.lastClickPosition.x   = evt.offsetX 
        input.lastClickPosition.y   = evt.offsetY
        input.lastClickPosition.new = true
        theatre.adjustPositionToStage(input.lastClickPosition)
      }
    }

    /**
     *  
     */ 
  , stageCanvasMouseupHandler: function(evt) {
      input.recordMouseMove = false
    }

    /**
     *  
     */ 
  , getPlayerMovementDirection: function(){

      input.movementDirectionData.vector.x          = 0
      input.movementDirectionData.vector.y          = 0
      input.movementDirectionData.playerInteraction = false
      input.movementDirectionData.isRunning         = input.shiftPressed

      if (input.keyPressed[37]  // left
        || input.keyPressed[65]){ // a
        input.movementDirectionData.vector.x -= 1
        input.movementDirectionData.playerInteraction = true
      }

      if (input.keyPressed[38]   // up
        || input.keyPressed[87]){ // w
        input.movementDirectionData.vector.y -= 1
        input.movementDirectionData.playerInteraction = true
      }

      if (input.keyPressed[39]   // right
        || input.keyPressed[68]){ // d

        input.movementDirectionData.vector.x += 1
        input.movementDirectionData.playerInteraction = true
      }

      if (input.keyPressed[40]   // down
        || input.keyPressed[83]){ // s
        input.movementDirectionData.vector.y += 1
        input.movementDirectionData.playerInteraction = true
      }

      return input.movementDirectionData
    }
}

module.exports = input

}());
