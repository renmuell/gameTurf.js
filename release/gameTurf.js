!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.gameTurf=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/******************************************************************************
 * game.js
 *
 * @package gameturf
 *****************************************************************************/

(function() {

/*global require, module */

var settings                  = _dereq_('./settings')
var input                     = _dereq_('./input')
var theatre                   = _dereq_('./theatre')
var world                     = _dereq_('./../systems/world')
var ui                        = _dereq_('./ui')
var entityCollisionDetection  = _dereq_('./../detectors/entityCollisionDetection')
var entityManager             = _dereq_('./../managers/entityManager')
var worldCollsitionDetection  = _dereq_('./../detectors/worldCollsitionDetection')
var wind                      = _dereq_('./../systems/wind')
var sound                     = _dereq_('./sound')
var Stats                     = _dereq_('../../vendors/stats.min')

/**
 *  This is the heart of the game engine. It conotains the functions to 
 *  start and stop the engine, it beholds the powerful game loop!
 *
 *  @dev Maybe make access to these functions easer. Insteat of
 *       Gameturf.game.init() make it Gameturf.init(). 
 */ 
var game = {

    /**
     *  Time of last step
     *  @type {date}
     */
    stepTimeThen: 0

    /**
     *  Time of step
     *  @type {date}
     */
  , stepTimeNow: 0

    /**
     *  Elapsed time since last step
     *  @type {number}
     */
  , stepTimeElapsed: 0

    /**
     *  
     *  @type {number}
     */  
  , timestep: 1000 / 60

  , maxFPS: 60

    /**
     *  is engine running
     *  @type {bool}
     */
  ,  isRunning              : false

  ,  fps: 60
  ,  framesThisSecond: 0
  ,  lastFpsUpdate: 0

    /**
     *  
     */
  , showStats              : false

    /**
     *  
     */
  , init: function(_settings) {

      settings = Object.assign(
        settings,
        _settings
      )

      if (game.showStats) game.statsSetup()

      theatre.init(settings.theatreMovesWithPlayer)

      sound.init()

      ui.init(theatre, function(){
        game.run()
      })

      input.init(theatre.stageCanvas)

      if (!settings.theatreMovesWithPlayer) world.draw()

      window.onblur = function () {
        game.pause()
      }

      input.onEscDown(function() {
        if (game.isRunning) game.pause()
        else game.run()
      })
    }

    /**
     *  
     */
  , run: function(){
      game.isRunning = true
      game.stepTimeElapsed = 0
      game.stepTimeNow = 0
      game.stepTimeThen = 0
      ui.closeMenu()
      sound.playBackgroundSound()
      requestAnimationFrame(game.loop)
    }

    /**
     *  
     */
  , pause: function(){
      ui.openMenu()
      sound.pauseBackgroundSound()
      game.isRunning = false
      game.stepTimeElapsed = 0
      game.stepTimeNow = 0
      game.stepTimeThen = 0
    }

    /**
     *  
     */
  , loop: function(){
      if (game.isRunning) {

        game.stepTimeNow = new Date().getTime()


        if (game.stepTimeThen !== 0) {
          game.stepTimeElapsed 
            = game.stepTimeNow - game.stepTimeThen
        }

        if (game.showStats) game.stats.begin();

        if (game.stepTimeElapsed  < game.lastFrameTimeMs + (1000 / game.maxFPS)) {
            requestAnimationFrame(game.loop);
            return;
        }

        if (game.stepTimeElapsed  > game.lastFpsUpdate + 1000) { // update every second
          game.fps = 0.25 * game.framesThisSecond + (1 - 0.25) * game.fps; // compute the new FPS
    
          game.lastFpsUpdate = game.stepTimeElapsed;
          game.framesThisSecond = 0;
        }
        game.framesThisSecond++;

        var numUpdateSteps = 0;
        while (game.stepTimeElapsed >= game.timestep) {
          game.update(game.timestep)
          game.postUpdate(game.timestep)
          game.stepTimeElapsed -= game.timestep;

          if (++numUpdateSteps >= 240) {
            game.panic(); // fix things
            break; // bail out
          }
        }

        game.preDraw(game.timestep)
        game.draw(game.timestep);

        if (game.showStats) game.stats.end()

        game.stepTimeThen = game.stepTimeNow 

        requestAnimationFrame(game.loop)
      }
    }

  , panic: function() {
        delta = 0; // discard the unsimulated time
        // ... snap the player to the authoritative state
    }

    /**
     *  
     */
  , update: function(delta){
      wind.update(delta)
      worldCollsitionDetection.update(delta)
      entityCollisionDetection.update(delta)
      entityManager.update(delta)
      ui.update(delta);
    }

    /**
     *  
     */
  , postUpdate: function(delta){
      entityManager.postUpdate(delta)
    }

    /**
     *  
     */
  , preDraw:function(delta){
     
      theatre.clearStage()
      entityManager.preDraw(delta)
      theatre.preShake()
    }

    /**
     *  
     */
  , draw: function(delta){
      entityManager.draw(delta)

      if (settings.theatreMovesWithPlayer) world.draw(delta);

      if (theatre.worldNeedsRedraw){
        theatre.clearWorld()
        world.draw(delta)
        theatre.worldNeedsRedraw = false
      }

      worldCollsitionDetection.draw(delta)
      wind.draw(delta)
      ui.draw(delta);
      theatre.postShake()
    }

    /**
     *  
     */
  , statsSetup: function () {
      game.stats = new Stats()
      game.stats.setMode(2) // 0: fps, 1: ms, 2: mb

      game.stats.domElement.style.position = 'absolute'
      game.stats.domElement.style.left = '0px'
      game.stats.domElement.style.top = '0px'

      document.body.appendChild(game.stats.domElement)
    }
}

if (ui.datGui) {
  var datGuiFolder = ui.datGui.addFolder("Game")
  ui.datGui.remember(game)
  datGuiFolder.add(game, "drawWorld")
}

module.exports = game

}());

},{"../../vendors/stats.min":25,"./../detectors/entityCollisionDetection":9,"./../detectors/worldCollsitionDetection":10,"./../managers/entityManager":18,"./../systems/wind":20,"./../systems/world":21,"./input":2,"./settings":4,"./sound":5,"./theatre":6,"./ui":7}],2:[function(_dereq_,module,exports){
/******************************************************************************
 * input.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var theatre = _dereq_('./theatre')

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

},{"./theatre":6}],3:[function(_dereq_,module,exports){
/******************************************************************************
 * math.js
 *
 * 
 *****************************************************************************/

(function() {

/*global module */
  
/**
 *  
 */ 
var math = {
    
    /**
     *  Subtracts a 2-dimensional vector from another vector.
     */
    vectorSubstract: function (vector1, vector2) {
      return {
        x: vector1.x - vector2.x
      , y: vector1.y - vector2.y
      }
    }
}

module.exports =  math

}());

},{}],4:[function(_dereq_,module,exports){
/******************************************************************************
 * settings.js
 *
 * 
 *****************************************************************************/

(function() {

/*global module */

/**
 *  
 */ 
module.exports = {

    /**
     *  
     */ 
    tileSize              : 50

    /**
     *  
     */ 
  , datGuiIsOn            : false

    /**
     *  
     */ 
  , physicsDebugMode      : false

    /**
     *  
     */ 
  , debugWorldCollisions  : false

    /**
     *  
     */ 
  , soundEngineOn         : true

    /**
     *  
     */ 
  , alloweBackgroundMusic : false

    /**
     *  
     */ 
  , effectMusicVolume     : .2

    /**
     *  
     */
  , theatreMovesWithPlayer : true

    /**
     *  
     */
  , effects : []

    /**
     *  
     */
  , backgroundSong: {
      src: undefined,
      volume: 1
    }
}

}());

},{}],5:[function(_dereq_,module,exports){
/******************************************************************************
 * sound.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var Howl = _dereq_('../../vendors/howler.min')
var settings = _dereq_('./settings')
var Howl = Howl.Howl;

/**
 *  
 */ 
var sound = {

    /**
     *  
     */ 
    effects               : {}

    /**
     *  
     */ 
  , backgroundSong        : undefined

    /**
     *  
     */ 
  , init: function(){

      if (settings.soundEngineOn) {

        if (settings.effects) {
          settings.effects.forEach(function(effect){
            sound.addEffect(effect.id, effect.src , effect.volume)
          })
        }

        if (settings.alloweBackgroundMusic
         && settings.backgroundSong.src) {
         
          sound.backgroundSong = new Howl({
              src   : [settings.backgroundSong.src]
            , loop  : true
            , volume: settings.backgroundSong.volume
          })
        }
      }
    }

    /**
     *  
     */ 
  , addEffect: function(name, file, volume){
      sound.effects[name] = sound.createEffect(
          file
        , volume * settings.effectMusicVolume)
    }

    /**
     *  
     */ 
  , createEffect: function(file, volume){

      var effect = {
          isPlaying : false
        , howl      : new Howl({
            src   : [file]
          , volume: volume
          , onend : function(){
              effect.isPlaying = false
            }
          })
        , play: function(onlyIfNotPlaying){

            if(onlyIfNotPlaying && effect.isPlaying) {
              return
            }

            effect.isPlaying = true
            effect.howl.play()
          }
        }

      return effect
    }

    /**
     *  
     */ 
  , playEffect: function(name, onlyIfNotPlaying){
      if (settings.soundEngineOn) {
        var effect = sound.effects[name]
        if (effect) {
          effect.play(onlyIfNotPlaying)
        }
      }
    }

    /**
     *  
     */ 
  , playBackgroundSound: function(){
      if (settings.alloweBackgroundMusic) {
        sound.backgroundSong.play()
      }
    }

    /**
     *  
     */ 
  , pauseBackgroundSound: function(){
      if (settings.alloweBackgroundMusic) {
        sound.backgroundSong.pause()
      }
    }
}

module.exports = sound

}());

},{"../../vendors/howler.min":24,"./settings":4}],6:[function(_dereq_,module,exports){
/******************************************************************************
 * theatre.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var ui = _dereq_('./ui')

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

  , useResolutionDevider : true
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

        var posX = (theatre.stageCanvas.width  / 2) - physics.position.x
        var posY = (theatre.stageCanvas.height / 2) - physics.position.y

        theatre.stage.setTransform(1, 0, 0, 1, posX, posY)
        theatre.backdrop.setTransform(1, 0, 0, 1, posX, posY)

        theatre.canvasBoxLeft   = physics.position.x - (theatre.stageCanvas.width  / 2)
        theatre.canvasBoxRight  = physics.position.x + (theatre.stageCanvas.width  / 2)
        theatre.canvasBoxTop    = physics.position.y - (theatre.stageCanvas.height / 2)
        theatre.canvasBoxBottom = physics.position.y + (theatre.stageCanvas.height / 2)

        theatre.worldNeedsRedraw = true
      
      } else {

        if (physics.position.x < theatre.canvasBoxLeft) {
          
          theatre.currentTranslateX  += theatre.canvasWidth
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxLeft   -= theatre.canvasWidth
          theatre.canvasBoxRight  -= theatre.canvasWidth
          theatre.worldNeedsRedraw = true
          // translate left
        
        } else if (physics.position.x > theatre.canvasBoxRight){
          
          // translate right
          theatre.currentTranslateX  -= theatre.canvasWidth
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxLeft   += theatre.canvasWidth
          theatre.canvasBoxRight  += theatre.canvasWidth
          theatre.worldNeedsRedraw = true

        } else if (physics.position.y < theatre.canvasBoxTop){
          
          // translate top
          theatre.currentTranslateY  += theatre.canvasHeight
          theatre.stage.setTransform(1,0,0,1, theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.backdrop.setTransform(1,0,0,1,theatre.currentTranslateX, theatre.currentTranslateY)
          theatre.canvasBoxTop    -= theatre.canvasHeight
          theatre.canvasBoxBottom -= theatre.canvasHeight
          theatre.worldNeedsRedraw = true

        } else if (physics.position.y > theatre.canvasBoxBottom){
          
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
            physics.position.x + physics.halfWidth
          , physics.position.x - physics.halfWidth
          , physics.position.y - physics.halfHeight
          , physics.position.y + physics.halfHeight)){
        return;
      }

      theatre[canvas].beginPath()
      theatre[canvas].moveTo(
        Math.floor(physics.position.x)
      , Math.floor(physics.position.y - physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.position.x - physics.halfWidth)
      , Math.floor(physics.position.y + physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.position.x + physics.halfWidth)
      , Math.floor(physics.position.y + physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.position.x)
      , Math.floor(physics.position.y - physics.halfHeight))

      theatre[canvas].fillStyle = color
      theatre[canvas].fill()
    }
  
    /**
     *  
     */ 
  , drawTrianlgeFromCenterUpsideDown: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            physics.position.x + physics.halfWidth
          , physics.position.x - physics.halfWidth
          , physics.position.y - physics.halfHeight
          , physics.position.y + physics.halfHeight)){
        return;
      }

      theatre[canvas].beginPath()

      theatre[canvas].moveTo(
        Math.floor(physics.position.x)
      , Math.floor(physics.position.y + physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.position.x - physics.halfWidth)
      , Math.floor(physics.position.y - physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.position.x + physics.halfWidth)
      , Math.floor(physics.position.y - physics.halfHeight))
      theatre[canvas].lineTo(
        Math.floor(physics.position.x)
      , Math.floor(physics.position.y + physics.halfHeight))

      theatre[canvas].fillStyle = color
      theatre[canvas].fill()
    }
  
    /**
     *  
     */ 
  , drawSquareFromCenter: function(canvas, physics, color){

      if (theatre.isOutsideOfCanvas(
            physics.position.x + physics.halfWidth
          , physics.position.x - physics.halfWidth
          , physics.position.y - physics.halfHeight
          , physics.position.y + physics.halfHeight)){
        return;
      }

      theatre[canvas].fillStyle = color
      theatre[canvas].fillRect(
        Math.floor(physics.position.x - physics.halfWidth)
      , Math.floor(physics.position.y - physics.halfHeight)
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
            physics.position.x + physics.halfWidth
          , physics.position.x - physics.halfWidth
          , physics.position.y - physics.halfHeight
          , physics.position.y + physics.halfHeight)){
        return;
      }

      theatre[canvas].beginPath()
      theatre[canvas].arc(
        Math.floor(physics.position.x)
      , Math.floor(physics.position.y)
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
          Math.floor(physics.position.x)
        , Math.floor(physics.position.y))
        theatre[canvas].lineTo(
          Math.floor(physics.position.x + vector.x)
        , Math.floor(physics.position.y + vector.y))
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
            Math.floor(physics.position.x)
          , Math.floor(physics.position.y))
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

},{"./ui":7}],7:[function(_dereq_,module,exports){
/******************************************************************************
 * ui.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var dat       = _dereq_('./../../vendors/dat.gui.min')
var settings  = _dereq_('./settings')

/**
 *  
 */ 
var ui = {

  /**
   *  
   */ 
  menu  : document.getElementById("Menu")

, theatre: undefined

  /**
   *  
   */ 
, continueBtn  : document.getElementById("continue")

, bubbleList: []

  /**
   *  
   */ 
, datGui: settings.datGuiIsOn ? new dat.GUI() : undefined    

, init: function(theatre, continueGameCallback){

    ui.theatre = theatre

    ui.output              = document.getElementById('output');
    ui.output.style.width  = ui.theatre.canvasWidth  + "px";
    ui.output.style.height = ui.theatre.canvasHeight + "px";
    ui.output.style.position = 'absolute';
    ui.output.style.left = 0;
    ui.output.style.top = 0;
    ui.output.style.pointerEvents = "none";
    ui.output.style.zIndex = 1000;

    ui.continueBtn.addEventListener('click', function(){
      continueGameCallback();
    })
  }

, update: function(timeElapsed) {



  ui.bubbleList.forEach(function(bubble) {

    bubble.time -= timeElapsed;

    if (bubble.time <= 0) {
      bubble.element.remove();
      bubble.death = true;
    } else {
      ui.setBubblePosition(bubble.element, bubble.physics);
    }
  })

  ui.bubbleList = ui.bubbleList.filter(function (bubble) {
    return !bubble.death;
  });
}

, draw: function(timeElapsed) {
  
}

  /**
   *  
   */ 
, openMenu: function(){
    ui.menu.className = ""
  }

  /**
   *  
   */ 
, closeMenu: function(){
    ui.menu.className = "hide"
  }

, setBubblePosition: function (element, physics) {
  if (ui.theatre.useResolutionDevider) {
    element.style.top = (((ui.theatre.canvasBoxTop*ui.theatre.resolutionDevider)*-1) + (physics.position.y*ui.theatre.resolutionDevider) -(80)) + "px"
    element.style.left = ((((ui.theatre.canvasBoxLeft*ui.theatre.resolutionDevider)*-1) + (physics.position.x*ui.theatre.resolutionDevider)) -(100)) + "px"
  } else {
    element.style.top = ((ui.theatre.canvasBoxTop*-1) + (physics.position.y) -80) + "px"
    element.style.left = (((ui.theatre.canvasBoxLeft*-1) + physics.position.x) -100) + "px"
  }

}
, showBubble: function (physics, text, time) {

    var element = document.createElement("div");
    element.innerHTML = text;
    element.style.position = "absolute"
    element.classList = "bubble";
    element.style.height = "60px";
    element.style.lineHeight = "60px";
    element.style.width = "200px";
    element.style.backgroundColor = "rgba(255,255,255,.3)"
    element.style.textAlign = "center";
    element.style.borderRadius = "10px"
    ui.setBubblePosition(element, physics)
    ui.output.appendChild(element)

    ui.bubbleList.push({
      physics:physics
    , death: false
    , text: text
    , time: time
    , element: element
    })
  }
}

module.exports = ui

}());

},{"./../../vendors/dat.gui.min":23,"./settings":4}],8:[function(_dereq_,module,exports){
/******************************************************************************
 * util.js
 *
 * 
 *****************************************************************************/

(function() {

/*global module */

/**
 *  
 */ 
var util = {

    /**
     *  
     */ 
    vectorToDegree: function(vector) {
      return util.vectorToRadiant(vector) * 180 / Math.pi
    }

    /**
     *  
     */ 
  , vectorToRadiant: function(vector) {
      return Math.atan2(vector.x, vector.y)
    }

    /**
     *  
     */ 
  , vectorLength: function(vector){
      return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
    }

    /**
     *  
     */ 
  , scaleVectorBy: function(vector, value){
      return util.shrinkVectorToLength(vector, util.vectorLength(vector) * value)
    }

    /**
     *  
     */ 
  , shrinkVectorToLength: function(vector, newLength){
      vector    = util.setVectorToLengthOne(vector)
      vector.x *= newLength
      vector.y *= newLength
      return vector
    }

    /**
     *  
     */ 
  , getVectorAngleDegree: function(vector1, vector2){
      var a = (Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x))
      return a * 180 / Math.PI
    }

    /**
     *  
     */ 
  , setVectorToLengthOne: function(vector){
      if (util.vectorLength(vector) > 0) {

        var moveRadiant = util.vectorToRadiant(vector)

        vector.x = Math.sin(moveRadiant)
        vector.y = Math.cos(moveRadiant)
      }

      return vector
    }
}

module.exports = util

}());

},{}],9:[function(_dereq_,module,exports){
/******************************************************************************
 * entityCollisionDetection.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var entityManager = _dereq_('./../managers/entityManager')

/**
 *  
 */ 
var entityCollisionDetection = {

  /**
   *  
   */ 
  add: function(entity){
    entity.entityCollisions = []
  }

  /**
   *  
   */ 
, update: function(timeElapsed){

    for (var i = entityManager.visableEntities.length - 1; i >= 0; i--) {

      var entityId =entityManager.visableEntities[i].id
      var entity = entityManager.enitites[entityId]
      var checkEntites = entityManager.visableEntities

      for (var y = checkEntites.length - 1; y >= 0; y--) {

        var checkEntityId = checkEntites[y].id
        var checkEntity = entityManager.enitites[checkEntityId]

        if (checkEntityId != entityId) {
          if (entityCollisionDetection.collsitionDetectionOfTwoEntities(entity, checkEntity)){
            if ((entity.entityCollisions[checkEntity.Id] != undefined && !entity.entityCollisions[checkEntity.Id])
              || (checkEntity.entityCollisions[entity.Id] != undefined && !checkEntity.entityCollisions[entity.Id])) {

              entityCollisionDetection.calculateEntitiesCollisionReaction(entity, checkEntity)

              entity.entityCollisions[checkEntity.Id] = true
              checkEntity.entityCollisions[entity.Id] =  true
            }
          } else {
            entity.entityCollisions[checkEntity.Id] = false
            checkEntity.entityCollisions[entity.Id] = false
          }
        }
      }

      var objectCollision = false;
      for (var z = 0; z < entity.entityCollisions.length; z++) {
        if (entity.entityCollisions[z]) {
          objectCollision = true
          break
        }
      }
      
      entity.physics.setObjectCollision(objectCollision, entity.entityCollisions)
    }
  }

  /**
   *  
   */ 
, calculateEntitiesCollisionReaction: function(entity1, entity2){
    var newEntity1VelX = (entity1.physics.velocity.x * (entity1.physics.mass - entity2.physics.mass) + (2 * entity2.physics.mass * entity2.physics.velocity.x)) / (entity1.physics.mass + entity2.physics.mass)
      , newEntity1VelY = (entity1.physics.velocity.y * (entity1.physics.mass - entity2.physics.mass) + (2 * entity2.physics.mass * entity2.physics.velocity.y)) / (entity1.physics.mass + entity2.physics.mass)
      , newEntity2VelX = (entity2.physics.velocity.x * (entity2.physics.mass - entity1.physics.mass) + (2 * entity1.physics.mass * entity1.physics.velocity.x)) / (entity1.physics.mass + entity2.physics.mass)
      , newEntity2VelY = (entity2.physics.velocity.y * (entity2.physics.mass - entity1.physics.mass) + (2 * entity1.physics.mass * entity1.physics.velocity.y)) / (entity1.physics.mass + entity2.physics.mass)

    entity1.physics.setVelocity(newEntity1VelX, newEntity1VelY)
    entity2.physics.setVelocity(newEntity2VelX, newEntity2VelY)
  }

  /**
   *  
   */ 
, collsitionDetectionOfTwoEntities: function(entity1, entity2){

    var entity1HitBox = entity1.physics.getHitBox()
      , entity2itBox  = entity2.physics.getHitBox()

    return (entity1HitBox.Left   < entity2itBox.Right
          && entity1HitBox.Right  > entity2itBox.Left
          && entity1HitBox.Top    < entity2itBox.Bottom
          && entity1HitBox.Bottom > entity2itBox.Top)
  }

  /**
   *  
   */ 
, isEntityCollidingWithOtherEntites: function(entity){

    for (var i = entity.entityCollisions.length - 1; i >= 0; i--) {

      if (entity.entityCollisions[i] == undefined) {
        continue
      }

      if (entity.entityCollisions[i]) {
        return true
      }
    }

    return false
  }
}

module.exports = entityCollisionDetection

}());

},{"./../managers/entityManager":18}],10:[function(_dereq_,module,exports){
/******************************************************************************
 * worldCollsitionDetection.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */
  
var tilesHelper = _dereq_('./../helpers/tilesHelper')
var theatre     = _dereq_('./../core/theatre')
var sound       = _dereq_('./../core/sound')
var settings    = _dereq_('./../core/settings')
var physicsHelper = _dereq_('./../helpers/physicsHelper')

/**
 *  
 */ 
var worldCollsitionDetection = {

    /**
     *  
     */ 
    collsitions: []
  
    /**
     *  
     */ 
  , checkLines : []

    /**
     *  
     */ 
  , collsitionDetection: function(
      timeElapsed
    , mapWithTileTypes
    , worldWith
    , wolrdHeight
    , physics){

      var hitbox = physics.getHitBox();

      tilesHelper.calculateNeahrestTileWalls(
        mapWithTileTypes
      , worldWith
      , wolrdHeight
      , hitbox.centerPosition)

      var colide = false

      for (var tileNr = tilesHelper.neahrestTileWalls.length - 1; tileNr >= 0; tileNr--) {
        if (tilesHelper.neahrestTileWalls[tileNr]) {
          for (var tileWallNr = tilesHelper.neahrestTileWalls[tileNr].length - 1; tileWallNr >= 0; tileWallNr--) {
            colide = worldCollsitionDetection.calculateWallCollsitionDenfung(
                timeElapsed
              , tilesHelper.neahrestTileWalls[tileNr][tileWallNr]
              , physics
              , hitbox) || colide
          }
        }
      }

      return colide
    }

    /**
     *  
     */ 
  , calculateWallCollsitionDenfung: function(
      timeElapsed
    , wall
    , physics
    , hitbox) {

      for (var i = hitbox.points.length - 1; i >= 0; i--) {

        var hitboxPoint = hitbox.points[i];
        
        var hitboxPointFuturePosition = physics.calculateFuturePositionOf({
            x: hitboxPoint.x
          , y: hitboxPoint.y
        }, timeElapsed);

        if(worldCollsitionDetection.checkLineIntersectionFast(
              wall[0].x
            , wall[0].y
            , wall[1].x
            , wall[1].y
            , hitboxPoint.x
            , hitboxPoint.y
            , hitboxPointFuturePosition.x
            , hitboxPointFuturePosition.y)){

          if (settings.debugWorldCollisions) {
            worldCollsitionDetection.debugCollisionLine(
              wall[0].x
            , wall[0].y
            , wall[1].x
            , wall[1].y)
          }

          sound.playEffect('colide', true)

          var wallIsLeft  = true
            , wallIsRight = true
            , wallIsUp    = true
            , wallIsDown  = true

          for (var y = hitbox.points.length - 1; y >= 0; y--){
            wallIsLeft  = wallIsLeft  && (wall[0].x < hitbox.points[y].x && wall[1].x < hitbox.points[y].x)
            wallIsRight = wallIsRight && (wall[0].x > hitbox.points[y].x && wall[1].x > hitbox.points[y].x)
            wallIsUp    = wallIsUp    && (wall[0].y < hitbox.points[y].y && wall[1].y < hitbox.points[y].y)
            wallIsDown  = wallIsDown  && (wall[0].y > hitbox.points[y].y && wall[1].y > hitbox.points[y].y)
          }

          if (physics.isBounce) {

            if (wallIsRight && physics.velocity.x > 0) physics.velocity.x = -physics.velocity.x
            if (wallIsLeft  && physics.velocity.x < 0) physics.velocity.x = -physics.velocity.x
            if (wallIsDown  && physics.velocity.y > 0) physics.velocity.y = -physics.velocity.y
            if (wallIsUp    && physics.velocity.y < 0) physics.velocity.y = -physics.velocity.y

          } else {

            if (wallIsRight || wallIsLeft) physics.velocity.x = 0
            if (wallIsDown  || wallIsUp)   physics.velocity.y = 0

          }

          return true
        }
      }

      return false
    }

    /**
     *  
     */ 
  , checkLineIntersectionFast:  function (a,b,c,d,p,q,r,s) {

      if (settings.debugWorldCollisions) {
        worldCollsitionDetection.debugLine(a,b,c,d,p,q,r,s)
      }

      var det = (c - a) * (s - q) - (r - p) * (d - b)

      if (det === 0) {
      
        return false
      
      } else {
      
        var lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
          , gamma  = ((b - d) * (r - a) + (c - a) * (s - b)) / det

        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
      }
    }

    /**
     *  
     */ 
  , update: function(timeElapsed){
      if(settings.debugWorldCollisions) {
        worldCollsitionDetection.collsitions = []
        worldCollsitionDetection.checkLines  = []
      }
    }

    /**
     *  
     */ 
  , draw: function(timeElapsed){
      if(settings.debugWorldCollisions) {
        theatre.drawMultipleLines('stage', worldCollsitionDetection.checkLines, "#F24962")
        theatre.drawMultipleLines('stage', worldCollsitionDetection.collsitions, "blue")
      }
    }

    /**
     *  
     */ 
  , debugLine: function(a,b,c,d,p,q,r,s){

      worldCollsitionDetection.checkLines.push({
        lineStartX : a
      , lineStartY : b
      , lineEndX   : c
      , lineEndY   : d
      })

      worldCollsitionDetection.checkLines.push({
        lineStartX : p
      , lineStartY : q
      , lineEndX   : r
      , lineEndY   : s
      })
    }

    /**
     *  
     */ 
  , debugCollisionLine: function(a,b,c,d){
      worldCollsitionDetection.collsitions.push({
        lineStartX : a
      , lineStartY : b
      , lineEndX   : c
      , lineEndY   : d
      })
    }
}

module.exports =  worldCollsitionDetection

}());

},{"./../core/settings":4,"./../core/sound":5,"./../core/theatre":6,"./../helpers/physicsHelper":16,"./../helpers/tilesHelper":17}],11:[function(_dereq_,module,exports){
/******************************************************************************
 * face.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */
  
var theatre = _dereq_('./../core/theatre')
var util    = _dereq_('./../core/util')

module.exports = function(config){

  config = config || {}

  var face = {

      color                   : config.color || "#B0A183"
    , defaultFace             : undefined
    , currentFace             : undefined
    , faceExpressionDuration  : 200
    , faceExpressionStartTime : 0
    , positions               : undefined
    , leftEyePosition         : { x: 0, y: 0 }
    , rightEyePosition        : { x: 0, y: 0 }
    , mouthPosition           : { x: 0, y: 0 }
    , compareVector           : { x: 0, y:-1 }
    , eyeSize                 : 0
    , mouthCloseSize          : 0
    , mouthOpenSize           : 0

    , init: function(width){
        face.defaultFace    = face.drawNoramlFace
        face.currentFace    = face.drawNoramlFace
        face.eyeSize        = width * 0.2
        face.mouthOpenSize  = width * 0.2
        face.mouthCloseSize = width * 0.4
      }

    , addToDatGuiFolder: function(folder) {
        var faceFolder = folder.addFolder("Face")
        faceFolder.add(face, "faceExpressionDuration")
        faceFolder.add(face, "faceExpressionStartTime").listen()
      }

    , update: function(physics, isInteracting){

        if (physics.collsition)  {

          face.SetSurpiseFace()

        } else if (physics.isMoving) {

          if (face.faceExpressionStartTime) {

          } else if(isInteracting){

            var lookAngle = util.getVectorAngleDegree(face.compareVector, physics.velocity)

            if (lookAngle > -30 && lookAngle < 30) {
              face.SetFaceLookTop()
            } else if (lookAngle > 150 && lookAngle < 210){
              face.SetFaceLookDown()
            } else if (lookAngle < 180 && lookAngle > 2){
              face.SetFaceLookRight()
            } else if (lookAngle < -2 ||  lookAngle > 2 && lookAngle != 180){
              face.SetFaceLookLeft()
            }
          }
        }

        if (face.faceExpressionStartTime) {
          if (Date.now() - face.faceExpressionStartTime > face.faceExpressionDuration) {
            face.currentFace             = face.drawNoramlFace
            face.faceExpressionStartTime = undefined
          }
        }

        if (Math.random() > 0.995) {
          face.setNoramlFaceOpenEyes()
        }
      }

    , draw: function(physics) {
        face.currentFace(physics)
      }

      // Setter

    , SetSurpiseFace: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawSurpiseFace
      }

    , SetFaceLookLeft: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawFaceLookLeft
      }

    , SetFaceLookRight: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawFaceLookRight
      }

    , SetFaceLookTop: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawFaceLookTop
      }

    , SetFaceLookDown: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawFaceLookDown
      }

    , setNoramlFaceOpenEyes: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawNoramlFaceOpenEyes
      }

      // Draw Face
    , drawNoramlFace: function(physics) {

        // left eye
        face.leftEyePosition.x = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y = physics.position.y - (physics.height * 0.1)
        theatre.drawLine(
          'stage'
        , face.leftEyePosition
        , face.eyeSize
        , face.color)

        // right eye
        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.1)
        theatre.drawLine(
          'stage'
        , face.rightEyePosition
        , face.eyeSize
        , face.color)

        // close mouth
        face.mouthPosition.x = physics.position.x - (physics.width  * 0.2)
        face.mouthPosition.y = physics.position.y + (physics.height * 0.3)
        theatre.drawLine(
          'stage'
        , face.mouthPosition
        , face.mouthCloseSize
        , face.color)
      }

    , drawNoramlFaceOpenEyes: function(physics) {
        // linkes auge
        face.leftEyePosition.x = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y = physics.position.y - (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.leftEyePosition
        , face.eyeSize
        , face.color)

        // rechtes auge
        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.rightEyePosition
        , face.eyeSize
        , face.color)

        // closed mund
        face.mouthPosition.x = physics.position.x - (physics.width  * 0.2)
        face.mouthPosition.y = physics.position.y + (physics.height * 0.3)
        theatre.drawLine(
          'stage'
        , face.mouthPosition
        , face.mouthCloseSize
        , face.color)
      }

    , drawSurpiseFace: function(physics){
        // linkes auge
        face.leftEyePosition.x = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y = physics.position.y - (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.leftEyePosition
        , face.eyeSize
        , face.color)

        // rechtes auge
        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.rightEyePosition
        , face.eyeSize
        , face.color)

        // mund
        face.mouthPosition.x = physics.position.x - (physics.width  * 0.1)
        face.mouthPosition.y = physics.position.y + (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.mouthPosition
        , face.mouthOpenSize
        , face.color)
      }

    , drawFaceLookLeft: function(physics){

        face.leftEyePosition.x  = physics.position.x - (physics.width  * 0.4)
        face.leftEyePosition.y  = physics.position.y - (physics.height * 0.2)

        face.rightEyePosition.x = physics.position.x
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.2)

        face.drawFaceLook(physics)
      }

    , drawFaceLookRight: function(physics){

        face.leftEyePosition.x  = physics.position.x - (physics.width  * 0.2)
        face.leftEyePosition.y  = physics.position.y - (physics.height * 0.2)

        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.2)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.2)

        face.drawFaceLook(physics)
      }

    , drawFaceLookTop: function(physics){

        face.leftEyePosition.x  = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y  = physics.position.y - (physics.height * 0.25)

        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.25)

        face.drawFaceLook(physics)
      }

    , drawFaceLookDown: function(physics){

        face.leftEyePosition.x  = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y  = physics.position.y - (physics.height * 0.15)

        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.15)

        face.drawFaceLook(physics)
      }

    , drawFaceLook: function(physics){

        var shake   = physics.isRunning ? 2 : 1.1
          , offsetX = (Math.random() - 0.5) * shake
          , offsetY = (Math.random() - 0.5) * shake

        face.leftEyePosition.x  += offsetX
        face.leftEyePosition.y  += offsetY

        face.rightEyePosition.x += offsetX
        face.rightEyePosition.y += offsetY

        // linkes auge
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.leftEyePosition
        , face.eyeSize
        , face.color)

        // rechtes auge
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.rightEyePosition
        , face.eyeSize
        , face.color)

        // close mouth
        face.mouthPosition.x = physics.position.x - (physics.width  * 0.2) + offsetX
        face.mouthPosition.y = physics.position.y + (physics.height * 0.3) + offsetY

        theatre.drawLine(
          'stage'
        , face.mouthPosition
        , face.mouthCloseSize
        , face.color)
      }
    }

  return face
}

}());

},{"./../core/theatre":6,"./../core/util":8}],12:[function(_dereq_,module,exports){
/**
 * interaction.js
 *
 */

(function() {

    /*global require, module */

    module.exports = function(settings){
    
      settings = settings || {}
    
      var interaction = {
        
        onInteraction: settings.onInteraction || function (entity) {

        },
        
        drawHighlightBox: settings.drawHighlightBox || function () {

        }
      }
    
      return interaction
    }
    
    }());
    
},{}],13:[function(_dereq_,module,exports){
/******************************************************************************
 * lastPosition.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */
  
var theatre = _dereq_('./../core/theatre')

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

            lastPositions.positions[lastPositions.lastEntityIndex].x = physics.position.x
            lastPositions.positions[lastPositions.lastEntityIndex].y = physics.position.y

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

            tempPhysics.position = {
              x: lastPositions.positions[positionIndex].x
            , y: lastPositions.positions[positionIndex].y
            };
             
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
                        ((i * (0.5/lastPositions.maxLength)) + 0.1) + ")");
           
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

},{"./../core/theatre":6}],14:[function(_dereq_,module,exports){
/******************************************************************************
 * physics.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var util      = _dereq_('./../core/util')
var ui      = _dereq_('./../core/ui')
var world     = _dereq_('./../systems/world')
var settings  = _dereq_('./../core/settings')
var theatre   = _dereq_('./../core/theatre')
var entityManager = _dereq_('./../managers/entityManager')
var physicsHelper = _dereq_('./../helpers/physicsHelper')

module.exports = function(config){

  config = config || {}

  var physics = {

      position          : config.position          || { x:0, y:0 }
    , velocity          : config.velocity          || { x:0, y:0 }
    , speed             : config.speed             || 2
    , runSpeed          : config.runSpeed          || 4
    , mass              : config.mass              || 1
    , height            : config.height            || 20
    , width             : config.width             || 20
    , isBounce          : config.isBounce          || false
    , isFrictionless    : config.isFrictionless    != undefined ? config.isFrictionless : false
    , frictionMagnitude : config.frictionMagnitude || 0.5
    , canWorldColide    : config.canWorldColide    != undefined ? config.canWorldColide : true

    , isMoving     : false
    , angle        : 0
    , maxVelocity  : undefined
    , halfWidth    : undefined
    , halfHeight   : undefined
    , isRunning    : false
    , collsition   : false
    , objectCollision: false
    , entityCollisions: []
    , hitBox       : undefined
    , currentSpeed : 0

    , init: function(){
        physics.createHitBox()
        physics.halfHeight = physics.height/2
        physics.halfWidth  = physics.width/2
      }

    , addToDatGuiFolder: function(folder){
        var physicsFolder = folder.addFolder("Physics")
        physicsFolder.add(physics, "speed")
        physicsFolder.add(physics, "runSpeed")
        physicsFolder.add(physics, "isBounce")
        physicsFolder.add(physics, "angle")
        physicsFolder.add(physics, "mass")
        physicsFolder.add(physics, "currentSpeed").listen()
        physicsFolder.add(physics, "isFrictionless")
        physicsFolder.add(physics, "frictionMagnitude")
        physicsFolder.add(physics, "x").listen()
        physicsFolder.add(physics, "y").listen()
        physicsFolder.add(physics, "collsition").listen()
        physicsFolder.add(physics, "isMoving").listen()
        physicsFolder.add(physics, "isRunning").listen()
        physicsFolder.add(physics.velocity, "x").listen()
        physicsFolder.add(physics.velocity, "y").listen()
      }

    , calculateFriction: function(){
        if (!physics.isFrictionless) {
          if (physics.currentSpeed  > 0.1)
            physics.lowerVelocityTo(physics.currentSpeed - physics.frictionMagnitude)
          else
            physics.setVelocity(0, 0)
        }
      }

    , inputUpdate: function(input){
        if (input) {
          physics.isRunning = input.isRunning
          physics.maxVelocity = physics.isRunning ? physics.runSpeed : physics.speed

          physics.addVelocity(input.vector.x * (physics.maxVelocity/2), input.vector.y * (physics.maxVelocity/2))

          if (physics.currentSpeed > physics.maxVelocity)
            physics.lowerVelocityTo(physics.maxVelocity)
          else if (physics.currentSpeed < 0.2)
            physics.setVelocity(0, 0)
        }
      }

    , update: function(timeElapsed, input){
        physics.isMoving    = false
        physics.collsition  = false

        physics.calculateFriction()
        physics.inputUpdate(input)

        if (physics.currentSpeed > 0) {

          physics.isMoving = true

          physics.collsition = physics.collsitionDetection(timeElapsed)

          if (physics.objectCollision) {

            var entity = false;

            for (var i = 0; i < physics.entityCollisions.length; i++) {
              if (physics.entityCollisions[i]) {
                entity = entityManager.enitites[i]
              }
            }

            if (entity) {
              
              var hitBox = physics.getHitBox()
              var entityHitBox  = entity.physics.getHitBox()
        
              var objectIsLeft  = physics.position.x > entity.physics.position.x && hitBox.Left   < entityHitBox.Right
              , objectIsRight   = physics.position.x < entity.physics.position.x && hitBox.Right  > entityHitBox.Left
              , objectIsUp      = physics.position.y > entity.physics.position.y && hitBox.Top    < entityHitBox.Bottom
              , objectIsDown    = physics.position.y < entity.physics.position.y && hitBox.Bottom > entityHitBox.Top

              if (objectIsRight && physics.velocity.x > 0) physics.velocity.x = 0
              if (objectIsLeft  && physics.velocity.x < 0) physics.velocity.x = 0
              if (objectIsDown  && physics.velocity.y > 0) physics.velocity.y = 0
              if (objectIsUp    && physics.velocity.y < 0) physics.velocity.y = 0
            }
          }

          physics.position = physics.calculateFuturePositionOf(physics.position, timeElapsed)
        }
      }

    , calculateFuturePositionOf: function (position, timeElapsed) {
        position.x += physicsHelper.calculateVelocityForTime(timeElapsed, physics.velocity.x)
        position.y += physicsHelper.calculateVelocityForTime(timeElapsed, physics.velocity.y)
        return position
      }

    , draw: function(){
        if (settings.physicsDebugMode) physics.drawDebugInfo()
      }

    , createHitBox: function(){
        physics.hitBox = {
            centerPosition: {}
          , Left          : undefined
          , Right         : undefined
          , Bottom        : undefined
          , Top           : undefined
          , points        : [
              { x: undefined, y: undefined }
            , { x: undefined, y: undefined }
            , { x: undefined, y: undefined }
            , { x: undefined, y: undefined }
          ]
        }
      }

    , getHitBox: function() {
        physics.hitBox.centerPosition.x = physics.position.x
        physics.hitBox.centerPosition.y = physics.position.y

        physics.hitBox.Left   = physics.position.x - physics.halfWidth
        physics.hitBox.Right  = physics.position.x + physics.halfWidth
        physics.hitBox.Bottom = physics.position.y + physics.halfHeight
        physics.hitBox.Top    = physics.position.y - physics.halfHeight

        physics.hitBox.points[0].x = physics.hitBox.Left
        physics.hitBox.points[0].y = physics.hitBox.Top

        physics.hitBox.points[1].x = physics.hitBox.Left
        physics.hitBox.points[1].y = physics.hitBox.Bottom

        physics.hitBox.points[2].x = physics.hitBox.Right
        physics.hitBox.points[2].y = physics.hitBox.Top

        physics.hitBox.points[3].x = physics.hitBox.Right
        physics.hitBox.points[3].y = physics.hitBox.Bottom

        return physics.hitBox
      }

    , collsitionDetection: function(timeElapsed){
        if (physics.canWorldColide) {
          return world.collsitionDetection(
            timeElapsed
          , physics)
        }
        return false
      }

    , drawDebugInfo: function(){
        theatre.drawLineWithVector(
            'stage'
          , physics
          , {
                x: physics.velocity.x * 20
              , y: physics.velocity.y * 20
            }
          , "red")
      }

    , addVelocity: function(valueX, valueY) {
        physics.velocity.x += valueX
        physics.velocity.y += valueY
        physics.calculateSpeed()
      }

    , setVelocity: function(valueX, valueY){
        physics.velocity.x = valueX
        physics.velocity.y = valueY
        physics.calculateSpeed()
      }

    , lowerVelocityTo: function(value){
        util.shrinkVectorToLength(physics.velocity, value)
        physics.calculateSpeed()
      }

    , setObjectCollision: function (value, entityCollisions) {
      physics.objectCollision = value
      physics.entityCollisions = entityCollisions
    }

    , calculateSpeed: function(){
        physics.currentSpeed = util.vectorLength(physics.velocity)
      }
  }

  physics.init()

  return physics
}

}());

},{"./../core/settings":4,"./../core/theatre":6,"./../core/ui":7,"./../core/util":8,"./../helpers/physicsHelper":16,"./../managers/entityManager":18,"./../systems/world":21}],15:[function(_dereq_,module,exports){
/******************************************************************************
 * gameTurf.js
 *
 * 
 *****************************************************************************/

"use strict";

(function() {

/*global require, module */

module.exports = {

    settings : _dereq_('./core/settings')
,   input    : _dereq_('./core/input')
,   theatre  : _dereq_('./core/theatre')
,   ui       : _dereq_('./core/ui')
,   sound    : _dereq_('./core/sound')
,   util     : _dereq_('./core/util')
,   game     : _dereq_('./core/game')
,   face     : _dereq_('./entityPlugins/face')
,   physics  : _dereq_('./entityPlugins/physics')
,   wind     : _dereq_('./systems/wind')
,   math     : _dereq_('./core/math')
,   world    :  _dereq_('./systems/world')
,   interaction: _dereq_('./entityPlugins/interaction')
,   lastPositions : _dereq_('./entityPlugins/lastPositions')
,   entityManager : _dereq_('./managers/entityManager')
,   entityCollisionDetection : _dereq_('./detectors/entityCollisionDetection')
}

}())

},{"./core/game":1,"./core/input":2,"./core/math":3,"./core/settings":4,"./core/sound":5,"./core/theatre":6,"./core/ui":7,"./core/util":8,"./detectors/entityCollisionDetection":9,"./entityPlugins/face":11,"./entityPlugins/interaction":12,"./entityPlugins/lastPositions":13,"./entityPlugins/physics":14,"./managers/entityManager":18,"./systems/wind":20,"./systems/world":21}],16:[function(_dereq_,module,exports){
/**
 * physicsHelper.js
 *
 */

(function() {

    /*global require, module */
    
    var settings  = _dereq_('./../core/settings')
    
    var physicsHelper = {

        

        /**
         * 
         * @param {*} timeElapsed 
         * @param {*} velocityDirection 
         */
        calculateVelocityForTime: function (timeElapsed, velocityDirection) {
            return Math.round(((timeElapsed/10) * velocityDirection)*1000)/1000;
        }
    }
    
    module.exports = physicsHelper
    
}());

},{"./../core/settings":4}],17:[function(_dereq_,module,exports){
/******************************************************************************
 * tilesHelper.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var theatre   = _dereq_('./../core/theatre')
var settings  = _dereq_('./../core/settings')

var tileHelper = {

    tileWalls: []
  , grassHalmPositions: []
  , neahrestTileWalls: []

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

          if (map[arrayPosition] == 1) {

            var val = 0

            // oben ist keine wand
            if (y > 0 && map[(y - 1) * worldWith + x] == 1) {
              val |= 1
            }

            // rechts ist keine wand
            if (x < (worldWith-1) && map[y * worldWith + x + 1] == 1) {
              val |= 2
            }

            // unten ist keine wand
            if (y < (wolrdHeight-1) && map[(y + 1) * worldWith + x] == 1){
                val |= 4
            }

            // links ist keine wand
            if (x > 0 && map[y * worldWith + x - 1] == 1) {
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

  , drawTiles: function(mapWithTileTypes, worldWith, wolrdHeight){

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

      for (var y = mintileArrayPositionY; y <= maxtileArrayPositionY; y++) {
        for (var x = mintileArrayPositionX; x <= maxtileArrayPositionX; x++) {

          var tiletype = mapWithTileTypes[y * worldWith + x]

          if (tiletype === 0) continue

          var tileWidth      = settings.tileSize
            , tileHeight     = settings.tileSize
          
          tilePosition.x = (x * settings.tileSize)
          tilePosition.y = (y * settings.tileSize)

          theatre.drawSquareFromLeftTopCorner(
            'backdrop'
          , tilePosition
          , settings.tileSize +1
          , "#CCDDAF")

          //tileHelper.drawGrass(tilePosition, tileWidth, tileHeight)
        }
      }
    }
  
  , drawGrass: function(position, width, height){
      for (var i = 10; i >= 0; i--) {

        var grassHalmPosition;
        var key = position.x + ";" + position.y + ";" + i;
        if (tileHelper.grassHalmPositions[key]) {
          grassHalmPosition = tileHelper.grassHalmPositions[key];
        } else {
          grassHalmPosition = tileHelper.grassHalmPositions[key] = {
            x: position.x + (((Math.random() * width)  - 10) + 5)
          , y: position.y + (((Math.random() * height) - 10) + 5)
          }
        }

        theatre.drawSquareFromLeftTopCorner(
          'backdrop'
        , grassHalmPosition
        , 5
        , "rgba(167,191,127,0.3)")
      }
    }
}

module.exports = tileHelper

}());

},{"./../core/settings":4,"./../core/theatre":6}],18:[function(_dereq_,module,exports){
/******************************************************************************
 * entityManager.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var QuadTree  = _dereq_('../../vendors/QuadTree')
var theatre   = _dereq_('../core/theatre')
var util      = _dereq_('../core/util')
QuadTree = QuadTree.QuadTree;

var entityManager = {

    enitites        : []
  , visableEntities : []
  , tree            : new QuadTree({
      x      : 0
    , y      : 0
    , width  : 14000
    , height : 13000
    })

  , add: function(entity){
      var nextIndex                     = entityManager.enitites.length
      entity.Id                         = nextIndex
      entity.physics.id                 = nextIndex
      entityManager.enitites[nextIndex] = entity
    }

  , update: function(timeElapsed){

      entityManager.visableEntities = entityManager.tree.retrieveInBounds({
        x      : theatre.canvasBoxLeft
      , y      : theatre.canvasBoxTop
      , width  : theatre.canvasWidth
      , height : theatre.canvasHeight
      })

      for (var y = entityManager.enitites.length - 1; y >= 0; y--) {
        entityManager.enitites[y].update(timeElapsed)
      }

      entityManager.tree.clear();
      for (var i = entityManager.enitites.length - 1; i >= 0; i--) {
        entityManager.enitites[i].physics.position.id = entityManager.enitites[i].physics.id
        entityManager.tree.insert(entityManager.enitites[i].physics.position)
      }
    }

  , postUpdate: function(timeElapsed){
      for (var i = entityManager.enitites.length - 1; i >= 0; i--) {
        if (entityManager.enitites[i].postUpdate) {
          entityManager.enitites[i].postUpdate(timeElapsed)
        }
      }
    }
  
  , preDraw: function(timeElapsed){
      for (var i = entityManager.visableEntities.length - 1; i >= 0; i--) {
        var id = entityManager.visableEntities[i].id
        if (entityManager.enitites[id].preDraw) {
          entityManager.enitites[id].preDraw(timeElapsed)
        }
      }
    }

  , draw: function(timeElapsed){
      for (var i = entityManager.visableEntities.length - 1; i >= 0; i--) {
        var id = entityManager.visableEntities[i].id
        entityManager.enitites[id].draw(timeElapsed)
      }
    }

  , getNeahrestEntity: function(entity, maxRange){

      maxRange =  maxRange || 0

      var neahrestEnitty
      var neahrestEnittyDistance = Number.MAX_SAFE_INTEGER

      for (var y = entityManager.visableEntities.length - 1; y >= 0; y--) {
        var checkEntityId = entityManager.visableEntities[y].id
        var checkEntity   = entityManager.enitites[checkEntityId]

        if (entity.physics.id == checkEntityId) {
          continue
        }

        var distanceVector = {
          x: entity.physics.position.x - checkEntity.physics.position.x
        , y: entity.physics.position.y - checkEntity.physics.position.y
        }

        var checkDistance = util.vectorLength(distanceVector)

        if (checkDistance < neahrestEnittyDistance 
          && checkDistance <= maxRange) {
          neahrestEnitty         = checkEntity
          neahrestEnittyDistance = checkDistance
        }
      }

      return neahrestEnitty
    }
}

module.exports = entityManager

}())

},{"../../vendors/QuadTree":22,"../core/theatre":6,"../core/util":8}],19:[function(_dereq_,module,exports){
/******************************************************************************
 * windParticleFactory.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var theatre       = _dereq_('./../core/theatre')
var Physics       = _dereq_('./../entityPlugins/physics')
var LastPositions = _dereq_('./../entityPlugins/lastPositions')
var sound         = _dereq_('./../core/sound')
var physicsHelper = _dereq_('./../helpers/physicsHelper')

var WindParticleFactory = function(){

  var WindParticle = {
    
      physics: Physics({
        position: {
          x : 0
        , y : 0
        }
      , height         : 5
      , width          : 5
      , canWorldColide : false
      })
    , lastPositions: LastPositions({
        shouldDrawBodies: false
      , color: {
          r: 255
        , g: 255
        , b: 255
        }
      })
    , isAlive               : false
    , lifeTime              : 1500
    , createdTime           : undefined
    , movementDirectionData : {
        isRunning   : false
      , vector      : { x: 0, y: 0 }
      }

    , birth: function(){
        WindParticle.createdTime = Date.now()
        WindParticle.isAlive     = true
        sound.playEffect('wind')
        WindParticle.physics.position.x = theatre.canvasBoxLeft + (Math.random() * theatre.stageCanvas.width)
        WindParticle.physics.position.y = theatre.canvasBoxTop  + (Math.random() * theatre.stageCanvas.height)
      }

    , update: function(timeElapsed, windDirection, windSpeed){

        var currentLifeTime = Date.now() - WindParticle.createdTime

        if(currentLifeTime > WindParticle.lifeTime){

          WindParticle.isAlive = false
          WindParticle.lastPositions.clear()
        
        } else {
          // value between -1 and 1
          var currentLifeTimeNormal = (currentLifeTime / (WindParticle.lifeTime / 2)) - 1
          // negative quatraic function for high middle value and low start/end points
          var setTimeDelay = ((-1 * Math.pow(currentLifeTimeNormal, 2) + 1) * 150)

          WindParticle.lastPositions.lineWidth    = ((setTimeDelay) / 150) * 2
          WindParticle.lastPositions.setTimeDelay = setTimeDelay

          WindParticle.lastPositions.update(WindParticle.physics)

          WindParticle.physics.speed = windSpeed

          
          WindParticle.movementDirectionData.vector.x = (Math.random() - 0.5 + windDirection.x)
          WindParticle.movementDirectionData.vector.y = (Math.random() - 0.5 + windDirection.y)

          WindParticle.physics.update(timeElapsed, WindParticle.movementDirectionData)
        }
      }

      , draw: function(timeElapsed){

        WindParticle.lastPositions.draw(WindParticle.physics)
        /*
        var currentLifeTime = Date.now() - WindParticle.createdTime

        // value between -1 and 1
        var currentLifeTimeNormal = (currentLifeTime/(WindParticle.lifeTime/2)) - 1

        // negative quatraic function for high middle value and low start/end points
        var opacity = ((-1 * Math.pow(currentLifeTimeNormal, 2)) + 1)
        */
      }
  }

  return WindParticle
}

module.exports =  WindParticleFactory

}())

},{"./../core/sound":5,"./../core/theatre":6,"./../entityPlugins/lastPositions":13,"./../entityPlugins/physics":14,"./../helpers/physicsHelper":16}],20:[function(_dereq_,module,exports){
/******************************************************************************
 * wind.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var util                = _dereq_('./../core/util')
var WindParticleFactory = _dereq_('./WindParticleFactory')

var wind = {

    windParticles        : []
  , windDirection        : { x: 1, y:0 }
  , windSpeed            : 4
  , maxAliveWindPartiles : 10

  , init: function(){
      for (var i = 0; i < 10; i++) {
        wind.windParticles.push(WindParticleFactory())
      }
    }

  , incluenceEntityPhysic: function(physics, moveDirectionVector){
      if (Math.random() > 0.5) {
        moveDirectionVector.x += (wind.windDirection.x * (1 / physics.mass)) / 1000
        moveDirectionVector.y += (wind.windDirection.y * (1 / physics.mass)) / 1000
      }
    }

  , update: function(timeElapsed){

      if (Math.random()>0.995){
        wind.windSpeed = (Math.random() * 9) + 1
      }

      if (Math.random()>0.95) {
        wind.windDirection.x = Math.random() - 0.5 + wind.windDirection.x
        wind.windDirection.y = Math.random() - 0.5 + wind.windDirection.y
        util.setVectorToLengthOne(wind.windDirection)
      }

      if(Math.random() > (0.995 - (wind.windSpeed/100))) {
        for (var i = 0; i < wind.maxAliveWindPartiles; i++) {
          if (!wind.windParticles[i].isAlive){
            wind.windParticles[i].birth()
            break
          }
        }
      }

      for (var i = 0; i < wind.maxAliveWindPartiles; i++){
        if (wind.windParticles[i].isAlive){
          wind.windParticles[i].update(timeElapsed, wind.windDirection, wind.windSpeed)
        }
      }
    }

  , draw: function(timeElapsed){
      for (var i = 0; i < wind.maxAliveWindPartiles; i++){
        if (wind.windParticles[i].isAlive){
          wind.windParticles[i].draw(timeElapsed)
        }
      }
    }
}

wind.init()

module.exports = wind

}())

},{"./../core/util":8,"./WindParticleFactory":19}],21:[function(_dereq_,module,exports){
/******************************************************************************
 * gameTurf.js
 *
 * 
 *****************************************************************************/

 (function() {

/*global require, module */

var tilesHelper               = _dereq_('./../helpers/tilesHelper')
var worldCollsitionDetection  = _dereq_('./../detectors/worldCollsitionDetection')

var world = {

    map              : undefined
  , worldWith        : undefined
  , wolrdHeight      : undefined
  , mapWithTileTypes : undefined

    /**
     *  Initialize the World.
     *
     *  @param {array[number]} map  
     *  @param {number} height
     *  @param {number} width 
     */
  , init: function(
      map 
    , height 
    , width
    ){
      world.map              = map
      world.worldWith        = width
      world.wolrdHeight      = height
      world.mapWithTileTypes = tilesHelper.calculateMapWithTileTypes(
        world.map
      , world.worldWith
      , world.wolrdHeight)
    }

    /**
     *  Detect if hitbox is coliding with the world border.
     *  
     *  @param {} 
     */
  , collsitionDetection: function(
      timeElapsed
    , physics
    ){  
      return worldCollsitionDetection.collsitionDetection(
        timeElapsed
      , world.mapWithTileTypes
      , world.worldWith
      , world.wolrdHeight
      , physics)
    }

    /**
     *
     */
  , draw: function(timeElapsed) {
      tilesHelper.drawTiles(
        world.mapWithTileTypes
      , world.worldWith
      , world.wolrdHeight)
    }
};

module.exports =  world

}())

},{"./../detectors/worldCollsitionDetection":10,"./../helpers/tilesHelper":17}],22:[function(_dereq_,module,exports){
/*
	The MIT License

	Copyright (c) 2011 Mike Chambers

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/


/**
* A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.
* @module QuadTree
**/

(function(window) {

/****************** QuadTree ****************/

/**
* QuadTree data structure.
* @class QuadTree
* @constructor
* @param {Object} An object representing the bounds of the top level of the QuadTree. The object 
* should contain the following properties : x, y, width, height
* @param {Boolean} pointQuad Whether the QuadTree will contain points (true), or items with bounds 
* (width / height)(false). Default value is false.
* @param {Number} maxDepth The maximum number of levels that the quadtree will create. Default is 4.
* @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.
**/
function QuadTree(bounds, pointQuad, maxDepth, maxChildren)
{	
	var node;
	if(pointQuad)
	{
		
		node = new Node(bounds, 0, maxDepth, maxChildren);
	}
	else
	{
		node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
	}
	
	this.root = node;
}

/**
* The root node of the QuadTree which covers the entire area being segmented.
* @property root
* @type Node
**/
QuadTree.prototype.root = null;


/**
* Inserts an item into the QuadTree.
* @method insert
* @param {Object|Array} item The item or Array of items to be inserted into the QuadTree. The item should expose x, y 
* properties that represents its position in 2D space.
**/
QuadTree.prototype.insert = function(item)
{
	if(item instanceof Array)
	{
		var len = item.length;
		
		for(var i = 0; i < len; i++)
		{
			this.root.insert(item[i]);
		}
	}
	else
	{
		this.root.insert(item);
	}
}

/**
* Clears all nodes and children from the QuadTree
* @method clear
**/
QuadTree.prototype.clear = function()
{
	this.root.clear();
}

/**
* Retrieves all items / points in the same node as the specified item / point. If the specified item
* overlaps the bounds of a node, then all children in both nodes will be returned.
* @method retrieve
* @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape
* with dimensions (x, y, width, height) properties.
**/
QuadTree.prototype.retrieve = function(item)
{
	//get a copy of the array of items
	var out = this.root.retrieve(item).slice(0);
	//return QuadTree._filterResults(out, {x:item.x, y:item.y, width:0, height:0});
	return out;
}

QuadTree.prototype.retrieveInBounds = function (bounds)
{
	var treeResult = this.root.retrieveInBounds(bounds);
	return QuadTree._filterResults(treeResult, bounds);
}

QuadTree._filterResults = function(treeResult, bounds)
{
	var filteredResult = [];

	if(this.root instanceof BoundsNode)
	{
		for (var i=0; i < treeResult.length; i++)
		{
			var node = treeResult[i];
			if (QuadTree._isBoundOverlappingBound(node, bounds))
			{
				filteredResult.push(node);
			}
		}
	}
	else
	{
		for (var i=0; i < treeResult.length; i++)
		{
			var node = treeResult[i];
			if(QuadTree._isPointInsideBounds(node, bounds))
			{
				filteredResult.push(node);
			}
		}
	}

	return filteredResult;
}

QuadTree._isPointInsideBounds = function (point, bounds)
{
	return (
		(point.x >= bounds.x) &&
		(point.x <= bounds.x + bounds.width) &&
		(point.y >= bounds.y) &&
		(point.y <= bounds.y + bounds.height)
	);
}


QuadTree._isBoundOverlappingBound = function (b1, b2)
{
	return !(
	        b1.x > (b2.x + b2.width)  || 
			b2.x > (b1.x + b1.width)  || 
	        b1.y > (b2.y + b2.height) ||
	        b2.y > (b1.y + b1.height)
	   );
}

/************** Node ********************/


function Node(bounds, depth, maxDepth, maxChildren)
{
	this._bounds = bounds;
	this.children = [];
	this.nodes = [];
	
	if(maxChildren)
	{
		this._maxChildren = maxChildren;
		
	}
	
	if(maxDepth)
	{
		this._maxDepth = maxDepth;
	}
	
	if(depth)
	{
		this._depth = depth;
	}
}

//subnodes
Node.prototype.nodes = null;
Node.prototype._classConstructor = Node;

//children contained directly in the node
Node.prototype.children = null;
Node.prototype._bounds = null;

//read only
Node.prototype._depth = 0;

Node.prototype._maxChildren = 4;
Node.prototype._maxDepth = 4;

Node.TOP_LEFT = 0;
Node.TOP_RIGHT = 1;
Node.BOTTOM_LEFT = 2;
Node.BOTTOM_RIGHT = 3;


Node.prototype.insert = function(item)
{
	if(this.nodes.length)
	{
		var index = this._findIndex(item);
		
		this.nodes[index].insert(item);
		
		return;
	}

	this.children.push(item);

	var len = this.children.length;
	if(!(this._depth >= this._maxDepth) && 
		len > this._maxChildren)
	{
		this.subdivide();
		
		for(var i = 0; i < len; i++)
		{
			this.insert(this.children[i]);
		}
		
		this.children.length = 0;
	}
}

Node.prototype.retrieve = function(item)
{
	if(this.nodes.length)
	{
		var index = this._findIndex(item);
		
		return this.nodes[index].retrieve(item);
	}
	
	return this.children;
}

Node.prototype.retrieveInBounds = function(bounds)
{
	var result = [];

	if(this.collidesWith(bounds))
	{
		result = result.concat(this._stuckChildren);
		
		if(this.children.length)
		{
			result = result.concat(this.children);
		}
		else
		{
			if(this.nodes.length)
			{
				for (var i = 0; i < this.nodes.length; i++)
				{
					result = result.concat(this.nodes[i].retrieveInBounds(bounds));
				}
			}
		}
	}
	
	return result;
}


Node.prototype.collidesWith = function (bounds)
{
	var b1 = this._bounds;
	var b2 = bounds;

	return !(
	        b1.x > (b2.x + b2.width)  || 
			b2.x > (b1.x + b1.width)  || 
	        b1.y > (b2.y + b2.height) ||
	        b2.y > (b1.y + b1.height)
	   );
}

Node.prototype._findIndex = function(item)
{
	var b = this._bounds;
	var left = (item.x > b.x + b.width / 2)? false : true;
	var top = (item.y > b.y + b.height / 2)? false : true;
	
	//top left
	var index = Node.TOP_LEFT;
	if(left)
	{
		//left side
		if(!top)
		{
			//bottom left
			index = Node.BOTTOM_LEFT;
		}
	}
	else
	{
		//right side
		if(top)
		{
			//top right
			index = Node.TOP_RIGHT;
		}
		else
		{
			//bottom right
			index = Node.BOTTOM_RIGHT;
		}
	}
	
	return index;
}


Node.prototype.subdivide = function()
{
	var depth = this._depth + 1;
	
	var bx = this._bounds.x;
	var by = this._bounds.y;
	
	//floor the values
	var b_w_h = (this._bounds.width / 2)|0;
	var b_h_h = (this._bounds.height / 2)|0;
	var bx_b_w_h = bx + b_w_h;
	var by_b_h_h = by + b_h_h;

	//top left
	this.nodes[Node.TOP_LEFT] = new this._classConstructor({
		x:bx, 
		y:by, 
		width:b_w_h, 
		height:b_h_h
	}, 
	depth, this._maxDepth, this._maxChildren);
	
	//top right
	this.nodes[Node.TOP_RIGHT] = new this._classConstructor({
		x:bx_b_w_h,
		y:by,
		width:b_w_h, 
		height:b_h_h
	},
	depth, this._maxDepth, this._maxChildren);
	
	//bottom left
	this.nodes[Node.BOTTOM_LEFT] = new this._classConstructor({
		x:bx,
		y:by_b_h_h,
		width:b_w_h, 
		height:b_h_h
	},
	depth, this._maxDepth, this._maxChildren);
	
	
	//bottom right
	this.nodes[Node.BOTTOM_RIGHT] = new this._classConstructor({
		x:bx_b_w_h, 
		y:by_b_h_h,
		width:b_w_h, 
		height:b_h_h
	},
	depth, this._maxDepth, this._maxChildren);	
}

Node.prototype.clear = function()
{	
	this.children.length = 0;
	
	var len = this.nodes.length;
	for(var i = 0; i < len; i++)
	{
		this.nodes[i].clear();
	}
	
	this.nodes.length = 0;
}


/******************** BoundsQuadTree ****************/

function BoundsNode(bounds, depth, maxChildren, maxDepth)
{
	Node.call(this, bounds, depth, maxChildren, maxDepth);
	this._stuckChildren = [];
}

BoundsNode.prototype = new Node();
BoundsNode.prototype._classConstructor = BoundsNode;
BoundsNode.prototype._stuckChildren = null;

//we use this to collect and conctenate items being retrieved. This way
//we dont have to continuously create new Array instances.
//Note, when returned from QuadTree.retrieve, we then copy the array
BoundsNode.prototype._out = [];

BoundsNode.prototype.insert = function(item)
{	
	if(this.nodes.length)
	{
		var index = this._findIndex(item);
		var node = this.nodes[index];

		//todo: make _bounds bounds
		if(item.x >= node._bounds.x &&
			item.x + item.width <= node._bounds.x + node._bounds.width &&
			item.y >= node._bounds.y &&
			item.y + item.height <= node._bounds.y + node._bounds.height)
		{
			this.nodes[index].insert(item);
		}
		else
		{			
			this._stuckChildren.push(item);
		}
		
		return;
	}

	this.children.push(item);

	var len = this.children.length;
	
	if(!(this._depth >= this._maxDepth) && 
		len > this._maxChildren)
	{
		this.subdivide();
		
		for(var i = 0; i < len; i++)
		{
			this.insert(this.children[i]);
		}
		
		this.children.length = 0;
	}
}

BoundsNode.prototype.getChildren = function()
{
	return this.children.concat(this._stuckChildren);
}

BoundsNode.prototype.retrieve = function(item)
{
	var out = this._out;
	out.length = 0;
	if(this.nodes.length)
	{
		var index = this._findIndex(item);
		
		out.push.apply(out, this.nodes[index].retrieve(item));
	}
	
	out.push.apply(out, this._stuckChildren);
	out.push.apply(out, this.children);
	
	return out;
}

BoundsNode.prototype.clear = function()
{

	this._stuckChildren.length = 0;
	
	//array
	this.children.length = 0;
	
	var len = this.nodes.length;
	
	if(!len)
	{
		return;
	}
	
	for(var i = 0; i < len; i++)
	{
		this.nodes[i].clear();
	}
	
	//array
	this.nodes.length = 0;	
	
	//we could call the super clear function but for now, im just going to inline it
	//call the hidden super.clear, and make sure its called with this = this instance
	//Object.getPrototypeOf(BoundsNode.prototype).clear.call(this);
}

BoundsNode.prototype.getChildCount

window.QuadTree = QuadTree;

/*
//http://ejohn.org/blog/objectgetprototypeof/
if ( typeof Object.getPrototypeOf !== "function" ) {
  if ( typeof "test".__proto__ === "object" ) {
    Object.getPrototypeOf = function(object){
      return object.__proto__;
    };
  } else {
    Object.getPrototypeOf = function(object){
      // May break if the constructor has been tampered with
      return object.constructor.prototype;
    };
  }
}
*/

}(this));
},{}],23:[function(_dereq_,module,exports){
var dat=dat||{};dat.gui=dat.gui||{};dat.utils=dat.utils||{};dat.controllers=dat.controllers||{};dat.dom=dat.dom||{};dat.color=dat.color||{};dat.utils.css=function(){return{load:function(e,a){a=a||document;var b=a.createElement("link");b.type="text/css";b.rel="stylesheet";b.href=e;a.getElementsByTagName("head")[0].appendChild(b)},inject:function(e,a){a=a||document;var b=document.createElement("style");b.type="text/css";b.innerHTML=e;a.getElementsByTagName("head")[0].appendChild(b)}}}();
dat.utils.common=function(){var e=Array.prototype.forEach,a=Array.prototype.slice;return{BREAK:{},extend:function(b){this.each(a.call(arguments,1),function(a){for(var f in a)this.isUndefined(a[f])||(b[f]=a[f])},this);return b},defaults:function(b){this.each(a.call(arguments,1),function(a){for(var f in a)this.isUndefined(b[f])&&(b[f]=a[f])},this);return b},compose:function(){var b=a.call(arguments);return function(){for(var d=a.call(arguments),f=b.length-1;0<=f;f--)d=[b[f].apply(this,d)];return d[0]}},
each:function(a,d,f){if(e&&a.forEach===e)a.forEach(d,f);else if(a.length===a.length+0)for(var c=0,p=a.length;c<p&&!(c in a&&d.call(f,a[c],c)===this.BREAK);c++);else for(c in a)if(d.call(f,a[c],c)===this.BREAK)break},defer:function(a){setTimeout(a,0)},toArray:function(b){return b.toArray?b.toArray():a.call(b)},isUndefined:function(a){return void 0===a},isNull:function(a){return null===a},isNaN:function(a){return a!==a},isArray:Array.isArray||function(a){return a.constructor===Array},isObject:function(a){return a===
Object(a)},isNumber:function(a){return a===a+0},isString:function(a){return a===a+""},isBoolean:function(a){return!1===a||!0===a},isFunction:function(a){return"[object Function]"===Object.prototype.toString.call(a)}}}();
dat.controllers.Controller=function(e){var a=function(a,d){this.initialValue=a[d];this.domElement=document.createElement("div");this.object=a;this.property=d;this.__onFinishChange=this.__onChange=void 0};e.extend(a.prototype,{onChange:function(a){this.__onChange=a;return this},onFinishChange:function(a){this.__onFinishChange=a;return this},setValue:function(a){this.object[this.property]=a;this.__onChange&&this.__onChange.call(this,a);this.updateDisplay();return this},getValue:function(){return this.object[this.property]},
updateDisplay:function(){return this},isModified:function(){return this.initialValue!==this.getValue()}});return a}(dat.utils.common);
dat.dom.dom=function(e){function a(c){if("0"===c||e.isUndefined(c))return 0;c=c.match(d);return e.isNull(c)?0:parseFloat(c[1])}var b={};e.each({HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},function(c,a){e.each(c,function(c){b[c]=a})});var d=/(\d+(\.\d+)?)px/,f={makeSelectable:function(c,a){void 0!==c&&void 0!==c.style&&(c.onselectstart=a?function(){return!1}:function(){},c.style.MozUserSelect=a?"auto":"none",c.style.KhtmlUserSelect=
a?"auto":"none",c.unselectable=a?"on":"off")},makeFullscreen:function(c,a,d){e.isUndefined(a)&&(a=!0);e.isUndefined(d)&&(d=!0);c.style.position="absolute";a&&(c.style.left=0,c.style.right=0);d&&(c.style.top=0,c.style.bottom=0)},fakeEvent:function(c,a,d,f){d=d||{};var q=b[a];if(!q)throw Error("Event type "+a+" not supported.");var n=document.createEvent(q);switch(q){case "MouseEvents":n.initMouseEvent(a,d.bubbles||!1,d.cancelable||!0,window,d.clickCount||1,0,0,d.x||d.clientX||0,d.y||d.clientY||0,!1,
!1,!1,!1,0,null);break;case "KeyboardEvents":q=n.initKeyboardEvent||n.initKeyEvent;e.defaults(d,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0});q(a,d.bubbles||!1,d.cancelable,window,d.ctrlKey,d.altKey,d.shiftKey,d.metaKey,d.keyCode,d.charCode);break;default:n.initEvent(a,d.bubbles||!1,d.cancelable||!0)}e.defaults(n,f);c.dispatchEvent(n)},bind:function(c,a,d,b){c.addEventListener?c.addEventListener(a,d,b||!1):c.attachEvent&&c.attachEvent("on"+a,d);return f},
unbind:function(c,a,d,b){c.removeEventListener?c.removeEventListener(a,d,b||!1):c.detachEvent&&c.detachEvent("on"+a,d);return f},addClass:function(a,d){if(void 0===a.className)a.className=d;else if(a.className!==d){var b=a.className.split(/ +/);-1==b.indexOf(d)&&(b.push(d),a.className=b.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return f},removeClass:function(a,d){if(d){if(void 0!==a.className)if(a.className===d)a.removeAttribute("class");else{var b=a.className.split(/ +/),e=b.indexOf(d);-1!=
e&&(b.splice(e,1),a.className=b.join(" "))}}else a.className=void 0;return f},hasClass:function(a,d){return RegExp("(?:^|\\s+)"+d+"(?:\\s+|$)").test(a.className)||!1},getWidth:function(c){c=getComputedStyle(c);return a(c["border-left-width"])+a(c["border-right-width"])+a(c["padding-left"])+a(c["padding-right"])+a(c.width)},getHeight:function(c){c=getComputedStyle(c);return a(c["border-top-width"])+a(c["border-bottom-width"])+a(c["padding-top"])+a(c["padding-bottom"])+a(c.height)},getOffset:function(a){var d=
{left:0,top:0};if(a.offsetParent){do d.left+=a.offsetLeft,d.top+=a.offsetTop;while(a=a.offsetParent)}return d},isActive:function(a){return a===document.activeElement&&(a.type||a.href)}};return f}(dat.utils.common);
dat.controllers.OptionController=function(e,a,b){var d=function(f,c,e){d.superclass.call(this,f,c);var k=this;this.__select=document.createElement("select");if(b.isArray(e)){var l={};b.each(e,function(a){l[a]=a});e=l}b.each(e,function(a,c){var d=document.createElement("option");d.innerHTML=c;d.setAttribute("value",a);k.__select.appendChild(d)});this.updateDisplay();a.bind(this.__select,"change",function(){k.setValue(this.options[this.selectedIndex].value)});this.domElement.appendChild(this.__select)};
d.superclass=e;b.extend(d.prototype,e.prototype,{setValue:function(a){a=d.superclass.prototype.setValue.call(this,a);this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue());return a},updateDisplay:function(){this.__select.value=this.getValue();return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.controllers.NumberController=function(e,a){var b=function(d,f,c){b.superclass.call(this,d,f);c=c||{};this.__min=c.min;this.__max=c.max;this.__step=c.step;a.isUndefined(this.__step)?this.__impliedStep=0==this.initialValue?1:Math.pow(10,Math.floor(Math.log(this.initialValue)/Math.LN10))/10:this.__impliedStep=this.__step;d=this.__impliedStep;d=d.toString();d=-1<d.indexOf(".")?d.length-d.indexOf(".")-1:0;this.__precision=d};b.superclass=e;a.extend(b.prototype,e.prototype,{setValue:function(a){void 0!==
this.__min&&a<this.__min?a=this.__min:void 0!==this.__max&&a>this.__max&&(a=this.__max);void 0!==this.__step&&0!=a%this.__step&&(a=Math.round(a/this.__step)*this.__step);return b.superclass.prototype.setValue.call(this,a)},min:function(a){this.__min=a;return this},max:function(a){this.__max=a;return this},step:function(a){this.__step=a;return this}});return b}(dat.controllers.Controller,dat.utils.common);
dat.controllers.NumberControllerBox=function(e,a,b){var d=function(f,c,e){function k(){var a=parseFloat(n.__input.value);b.isNaN(a)||n.setValue(a)}function l(a){var c=r-a.clientY;n.setValue(n.getValue()+c*n.__impliedStep);r=a.clientY}function q(){a.unbind(window,"mousemove",l);a.unbind(window,"mouseup",q)}this.__truncationSuspended=!1;d.superclass.call(this,f,c,e);var n=this,r;this.__input=document.createElement("input");this.__input.setAttribute("type","text");a.bind(this.__input,"change",k);a.bind(this.__input,
"blur",function(){k();n.__onFinishChange&&n.__onFinishChange.call(n,n.getValue())});a.bind(this.__input,"mousedown",function(c){a.bind(window,"mousemove",l);a.bind(window,"mouseup",q);r=c.clientY});a.bind(this.__input,"keydown",function(a){13===a.keyCode&&(n.__truncationSuspended=!0,this.blur(),n.__truncationSuspended=!1)});this.updateDisplay();this.domElement.appendChild(this.__input)};d.superclass=e;b.extend(d.prototype,e.prototype,{updateDisplay:function(){var a=this.__input,c;if(this.__truncationSuspended)c=
this.getValue();else{c=this.getValue();var b=Math.pow(10,this.__precision);c=Math.round(c*b)/b}a.value=c;return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.NumberController,dat.dom.dom,dat.utils.common);
dat.controllers.NumberControllerSlider=function(e,a,b,d,f){function c(a,c,d,b,f){return b+(a-c)/(d-c)*(f-b)}var p=function(d,b,f,e,r){function y(d){d.preventDefault();var b=a.getOffset(h.__background),f=a.getWidth(h.__background);h.setValue(c(d.clientX,b.left,b.left+f,h.__min,h.__max));return!1}function g(){a.unbind(window,"mousemove",y);a.unbind(window,"mouseup",g);h.__onFinishChange&&h.__onFinishChange.call(h,h.getValue())}p.superclass.call(this,d,b,{min:f,max:e,step:r});var h=this;this.__background=
document.createElement("div");this.__foreground=document.createElement("div");a.bind(this.__background,"mousedown",function(c){a.bind(window,"mousemove",y);a.bind(window,"mouseup",g);y(c)});a.addClass(this.__background,"slider");a.addClass(this.__foreground,"slider-fg");this.updateDisplay();this.__background.appendChild(this.__foreground);this.domElement.appendChild(this.__background)};p.superclass=e;p.useDefaultStyles=function(){b.inject(f)};d.extend(p.prototype,e.prototype,{updateDisplay:function(){var a=
(this.getValue()-this.__min)/(this.__max-this.__min);this.__foreground.style.width=100*a+"%";return p.superclass.prototype.updateDisplay.call(this)}});return p}(dat.controllers.NumberController,dat.dom.dom,dat.utils.css,dat.utils.common,"/**\n * dat-gui JavaScript Controller Library\n * http://code.google.com/p/dat-gui\n *\n * Copyright 2011 Data Arts Team, Google Creative Lab\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n */\n\n.slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");
dat.controllers.FunctionController=function(e,a,b){var d=function(b,c,e){d.superclass.call(this,b,c);var k=this;this.__button=document.createElement("div");this.__button.innerHTML=void 0===e?"Fire":e;a.bind(this.__button,"click",function(a){a.preventDefault();k.fire();return!1});a.addClass(this.__button,"button");this.domElement.appendChild(this.__button)};d.superclass=e;b.extend(d.prototype,e.prototype,{fire:function(){this.__onChange&&this.__onChange.call(this);this.__onFinishChange&&this.__onFinishChange.call(this,
this.getValue());this.getValue().call(this.object)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.controllers.BooleanController=function(e,a,b){var d=function(b,c){d.superclass.call(this,b,c);var e=this;this.__prev=this.getValue();this.__checkbox=document.createElement("input");this.__checkbox.setAttribute("type","checkbox");a.bind(this.__checkbox,"change",function(){e.setValue(!e.__prev)},!1);this.domElement.appendChild(this.__checkbox);this.updateDisplay()};d.superclass=e;b.extend(d.prototype,e.prototype,{setValue:function(a){a=d.superclass.prototype.setValue.call(this,a);this.__onFinishChange&&
this.__onFinishChange.call(this,this.getValue());this.__prev=this.getValue();return a},updateDisplay:function(){!0===this.getValue()?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0):this.__checkbox.checked=!1;return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common);
dat.color.toString=function(e){return function(a){if(1==a.a||e.isUndefined(a.a)){for(a=a.hex.toString(16);6>a.length;)a="0"+a;return"#"+a}return"rgba("+Math.round(a.r)+","+Math.round(a.g)+","+Math.round(a.b)+","+a.a+")"}}(dat.utils.common);
dat.color.interpret=function(e,a){var b,d,f=[{litmus:a.isString,conversions:{THREE_CHAR_HEX:{read:function(a){a=a.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return null===a?!1:{space:"HEX",hex:parseInt("0x"+a[1].toString()+a[1].toString()+a[2].toString()+a[2].toString()+a[3].toString()+a[3].toString())}},write:e},SIX_CHAR_HEX:{read:function(a){a=a.match(/^#([A-F0-9]{6})$/i);return null===a?!1:{space:"HEX",hex:parseInt("0x"+a[1].toString())}},write:e},CSS_RGB:{read:function(a){a=a.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
return null===a?!1:{space:"RGB",r:parseFloat(a[1]),g:parseFloat(a[2]),b:parseFloat(a[3])}},write:e},CSS_RGBA:{read:function(a){a=a.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);return null===a?!1:{space:"RGB",r:parseFloat(a[1]),g:parseFloat(a[2]),b:parseFloat(a[3]),a:parseFloat(a[4])}},write:e}}},{litmus:a.isNumber,conversions:{HEX:{read:function(a){return{space:"HEX",hex:a,conversionName:"HEX"}},write:function(a){return a.hex}}}},{litmus:a.isArray,conversions:{RGB_ARRAY:{read:function(a){return 3!=
a.length?!1:{space:"RGB",r:a[0],g:a[1],b:a[2]}},write:function(a){return[a.r,a.g,a.b]}},RGBA_ARRAY:{read:function(a){return 4!=a.length?!1:{space:"RGB",r:a[0],g:a[1],b:a[2],a:a[3]}},write:function(a){return[a.r,a.g,a.b,a.a]}}}},{litmus:a.isObject,conversions:{RGBA_OBJ:{read:function(c){return a.isNumber(c.r)&&a.isNumber(c.g)&&a.isNumber(c.b)&&a.isNumber(c.a)?{space:"RGB",r:c.r,g:c.g,b:c.b,a:c.a}:!1},write:function(a){return{r:a.r,g:a.g,b:a.b,a:a.a}}},RGB_OBJ:{read:function(c){return a.isNumber(c.r)&&
a.isNumber(c.g)&&a.isNumber(c.b)?{space:"RGB",r:c.r,g:c.g,b:c.b}:!1},write:function(a){return{r:a.r,g:a.g,b:a.b}}},HSVA_OBJ:{read:function(c){return a.isNumber(c.h)&&a.isNumber(c.s)&&a.isNumber(c.v)&&a.isNumber(c.a)?{space:"HSV",h:c.h,s:c.s,v:c.v,a:c.a}:!1},write:function(a){return{h:a.h,s:a.s,v:a.v,a:a.a}}},HSV_OBJ:{read:function(d){return a.isNumber(d.h)&&a.isNumber(d.s)&&a.isNumber(d.v)?{space:"HSV",h:d.h,s:d.s,v:d.v}:!1},write:function(a){return{h:a.h,s:a.s,v:a.v}}}}}];return function(){d=!1;
var c=1<arguments.length?a.toArray(arguments):arguments[0];a.each(f,function(e){if(e.litmus(c))return a.each(e.conversions,function(e,f){b=e.read(c);if(!1===d&&!1!==b)return d=b,b.conversionName=f,b.conversion=e,a.BREAK}),a.BREAK});return d}}(dat.color.toString,dat.utils.common);
dat.GUI=dat.gui.GUI=function(e,a,b,d,f,c,p,k,l,q,n,r,y,g,h){function t(a,c,b,e){if(void 0===c[b])throw Error("Object "+c+' has no property "'+b+'"');e.color?c=new n(c,b):(c=[c,b].concat(e.factoryArgs),c=d.apply(a,c));e.before instanceof f&&(e.before=e.before.__li);v(a,c);g.addClass(c.domElement,"c");b=document.createElement("span");g.addClass(b,"property-name");b.innerHTML=c.property;var q=document.createElement("div");q.appendChild(b);q.appendChild(c.domElement);e=u(a,q,e.before);g.addClass(e,m.CLASS_CONTROLLER_ROW);
g.addClass(e,typeof c.getValue());s(a,e,c);a.__controllers.push(c);return c}function u(a,d,c){var b=document.createElement("li");d&&b.appendChild(d);c?a.__ul.insertBefore(b,params.before):a.__ul.appendChild(b);a.onResize();return b}function s(a,d,b){b.__li=d;b.__gui=a;h.extend(b,{options:function(d){if(1<arguments.length)return b.remove(),t(a,b.object,b.property,{before:b.__li.nextElementSibling,factoryArgs:[h.toArray(arguments)]});if(h.isArray(d)||h.isObject(d))return b.remove(),t(a,b.object,b.property,
{before:b.__li.nextElementSibling,factoryArgs:[d]})},name:function(a){b.__li.firstElementChild.firstElementChild.innerHTML=a;return b},listen:function(){b.__gui.listen(b);return b},remove:function(){b.__gui.remove(b);return b}});if(b instanceof l){var e=new k(b.object,b.property,{min:b.__min,max:b.__max,step:b.__step});h.each(["updateDisplay","onChange","onFinishChange"],function(a){var d=b[a],J=e[a];b[a]=e[a]=function(){var a=Array.prototype.slice.call(arguments);d.apply(b,a);return J.apply(e,a)}});
g.addClass(d,"has-slider");b.domElement.insertBefore(e.domElement,b.domElement.firstElementChild)}else if(b instanceof k){var f=function(d){return h.isNumber(b.__min)&&h.isNumber(b.__max)?(b.remove(),t(a,b.object,b.property,{before:b.__li.nextElementSibling,factoryArgs:[b.__min,b.__max,b.__step]})):d};b.min=h.compose(f,b.min);b.max=h.compose(f,b.max)}else b instanceof c?(g.bind(d,"click",function(){g.fakeEvent(b.__checkbox,"click")}),g.bind(b.__checkbox,"click",function(a){a.stopPropagation()})):
b instanceof p?(g.bind(d,"click",function(){g.fakeEvent(b.__button,"click")}),g.bind(d,"mouseover",function(){g.addClass(b.__button,"hover")}),g.bind(d,"mouseout",function(){g.removeClass(b.__button,"hover")})):b instanceof n&&(g.addClass(d,"color"),b.updateDisplay=h.compose(function(a){d.style.borderLeftColor=b.__color.toString();return a},b.updateDisplay),b.updateDisplay());b.setValue=h.compose(function(d){a.getRoot().__preset_select&&b.isModified()&&D(a.getRoot(),!0);return d},b.setValue)}function v(a,
d){var b=a.getRoot(),c=b.__rememberedObjects.indexOf(d.object);if(-1!=c){var e=b.__rememberedObjectIndecesToControllers[c];void 0===e&&(e={},b.__rememberedObjectIndecesToControllers[c]=e);e[d.property]=d;if(b.load&&b.load.remembered){b=b.load.remembered;if(b[a.preset])b=b[a.preset];else if(b[z])b=b[z];else return;b[c]&&void 0!==b[c][d.property]&&(c=b[c][d.property],d.initialValue=c,d.setValue(c))}}}function K(a){var b=a.__save_row=document.createElement("li");g.addClass(a.domElement,"has-save");a.__ul.insertBefore(b,
a.__ul.firstChild);g.addClass(b,"save-row");var d=document.createElement("span");d.innerHTML="&nbsp;";g.addClass(d,"button gears");var c=document.createElement("span");c.innerHTML="Save";g.addClass(c,"button");g.addClass(c,"save");var e=document.createElement("span");e.innerHTML="New";g.addClass(e,"button");g.addClass(e,"save-as");var f=document.createElement("span");f.innerHTML="Revert";g.addClass(f,"button");g.addClass(f,"revert");var q=a.__preset_select=document.createElement("select");a.load&&
a.load.remembered?h.each(a.load.remembered,function(b,d){E(a,d,d==a.preset)}):E(a,z,!1);g.bind(q,"change",function(){for(var b=0;b<a.__preset_select.length;b++)a.__preset_select[b].innerHTML=a.__preset_select[b].value;a.preset=this.value});b.appendChild(q);b.appendChild(d);b.appendChild(c);b.appendChild(e);b.appendChild(f);if(w){var b=document.getElementById("dg-save-locally"),n=document.getElementById("dg-local-explain");b.style.display="block";b=document.getElementById("dg-local-storage");"true"===
localStorage.getItem(document.location.href+".isLocal")&&b.setAttribute("checked","checked");var k=function(){n.style.display=a.useLocalStorage?"block":"none"};k();g.bind(b,"change",function(){a.useLocalStorage=!a.useLocalStorage;k()})}var r=document.getElementById("dg-new-constructor");g.bind(r,"keydown",function(a){!a.metaKey||67!==a.which&&67!=a.keyCode||A.hide()});g.bind(d,"click",function(){r.innerHTML=JSON.stringify(a.getSaveObject(),void 0,2);A.show();r.focus();r.select()});g.bind(c,"click",
function(){a.save()});g.bind(e,"click",function(){var b=prompt("Enter a new preset name.");b&&a.saveAs(b)});g.bind(f,"click",function(){a.revert()})}function L(a){function b(f){f.preventDefault();e=f.clientX;g.addClass(a.__closeButton,m.CLASS_DRAG);g.bind(window,"mousemove",d);g.bind(window,"mouseup",c);return!1}function d(b){b.preventDefault();a.width+=e-b.clientX;a.onResize();e=b.clientX;return!1}function c(){g.removeClass(a.__closeButton,m.CLASS_DRAG);g.unbind(window,"mousemove",d);g.unbind(window,
"mouseup",c)}a.__resize_handle=document.createElement("div");h.extend(a.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"});var e;g.bind(a.__resize_handle,"mousedown",b);g.bind(a.__closeButton,"mousedown",b);a.domElement.insertBefore(a.__resize_handle,a.domElement.firstElementChild)}function F(a,b){a.domElement.style.width=b+"px";a.__save_row&&a.autoPlace&&(a.__save_row.style.width=b+"px");a.__closeButton&&(a.__closeButton.style.width=b+"px")}
function B(a,b){var d={};h.each(a.__rememberedObjects,function(c,e){var f={};h.each(a.__rememberedObjectIndecesToControllers[e],function(a,d){f[d]=b?a.initialValue:a.getValue()});d[e]=f});return d}function E(a,b,d){var c=document.createElement("option");c.innerHTML=b;c.value=b;a.__preset_select.appendChild(c);d&&(a.__preset_select.selectedIndex=a.__preset_select.length-1)}function D(a,b){var d=a.__preset_select[a.__preset_select.selectedIndex];d.innerHTML=b?d.value+"*":d.value}function G(a){0!=a.length&&
r(function(){G(a)});h.each(a,function(a){a.updateDisplay()})}e.inject(b);var z="Default",w;try{w="localStorage"in window&&null!==window.localStorage}catch(M){w=!1}var A,H=!0,x,C=!1,I=[],m=function(a){function b(){localStorage.setItem(document.location.href+".gui",JSON.stringify(c.getSaveObject()))}function d(){var a=c.getRoot();a.width+=1;h.defer(function(){a.width-=1})}var c=this;this.domElement=document.createElement("div");this.__ul=document.createElement("ul");this.domElement.appendChild(this.__ul);
g.addClass(this.domElement,"dg");this.__folders={};this.__controllers=[];this.__rememberedObjects=[];this.__rememberedObjectIndecesToControllers=[];this.__listening=[];a=a||{};a=h.defaults(a,{autoPlace:!0,width:m.DEFAULT_WIDTH});a=h.defaults(a,{resizable:a.autoPlace,hideable:a.autoPlace});h.isUndefined(a.load)?a.load={preset:z}:a.preset&&(a.load.preset=a.preset);h.isUndefined(a.parent)&&a.hideable&&I.push(this);a.resizable=h.isUndefined(a.parent)&&a.resizable;a.autoPlace&&h.isUndefined(a.scrollable)&&
(a.scrollable=!0);var e=w&&"true"===localStorage.getItem(document.location.href+".isLocal");Object.defineProperties(this,{parent:{get:function(){return a.parent}},scrollable:{get:function(){return a.scrollable}},autoPlace:{get:function(){return a.autoPlace}},preset:{get:function(){return c.parent?c.getRoot().preset:a.load.preset},set:function(b){c.parent?c.getRoot().preset=b:a.load.preset=b;for(b=0;b<this.__preset_select.length;b++)this.__preset_select[b].value==this.preset&&(this.__preset_select.selectedIndex=
b);c.revert()}},width:{get:function(){return a.width},set:function(b){a.width=b;F(c,b)}},name:{get:function(){return a.name},set:function(b){a.name=b;q&&(q.innerHTML=a.name)}},closed:{get:function(){return a.closed},set:function(b){a.closed=b;a.closed?g.addClass(c.__ul,m.CLASS_CLOSED):g.removeClass(c.__ul,m.CLASS_CLOSED);this.onResize();c.__closeButton&&(c.__closeButton.innerHTML=b?m.TEXT_OPEN:m.TEXT_CLOSED)}},load:{get:function(){return a.load}},useLocalStorage:{get:function(){return e},set:function(a){w&&
((e=a)?g.bind(window,"unload",b):g.unbind(window,"unload",b),localStorage.setItem(document.location.href+".isLocal",a))}}});if(h.isUndefined(a.parent)){a.closed=!1;g.addClass(this.domElement,m.CLASS_MAIN);g.makeSelectable(this.domElement,!1);if(w&&e){c.useLocalStorage=!0;var f=localStorage.getItem(document.location.href+".gui");f&&(a.load=JSON.parse(f))}this.__closeButton=document.createElement("div");this.__closeButton.innerHTML=m.TEXT_CLOSED;g.addClass(this.__closeButton,m.CLASS_CLOSE_BUTTON);this.domElement.appendChild(this.__closeButton);
g.bind(this.__closeButton,"click",function(){c.closed=!c.closed})}else{void 0===a.closed&&(a.closed=!0);var q=document.createTextNode(a.name);g.addClass(q,"controller-name");f=u(c,q);g.addClass(this.__ul,m.CLASS_CLOSED);g.addClass(f,"title");g.bind(f,"click",function(a){a.preventDefault();c.closed=!c.closed;return!1});a.closed||(this.closed=!1)}a.autoPlace&&(h.isUndefined(a.parent)&&(H&&(x=document.createElement("div"),g.addClass(x,"dg"),g.addClass(x,m.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(x),
H=!1),x.appendChild(this.domElement),g.addClass(this.domElement,m.CLASS_AUTO_PLACE)),this.parent||F(c,a.width));g.bind(window,"resize",function(){c.onResize()});g.bind(this.__ul,"webkitTransitionEnd",function(){c.onResize()});g.bind(this.__ul,"transitionend",function(){c.onResize()});g.bind(this.__ul,"oTransitionEnd",function(){c.onResize()});this.onResize();a.resizable&&L(this);c.getRoot();a.parent||d()};m.toggleHide=function(){C=!C;h.each(I,function(a){a.domElement.style.zIndex=C?-999:999;a.domElement.style.opacity=
C?0:1})};m.CLASS_AUTO_PLACE="a";m.CLASS_AUTO_PLACE_CONTAINER="ac";m.CLASS_MAIN="main";m.CLASS_CONTROLLER_ROW="cr";m.CLASS_TOO_TALL="taller-than-window";m.CLASS_CLOSED="closed";m.CLASS_CLOSE_BUTTON="close-button";m.CLASS_DRAG="drag";m.DEFAULT_WIDTH=245;m.TEXT_CLOSED="Close Controls";m.TEXT_OPEN="Open Controls";g.bind(window,"keydown",function(a){"text"===document.activeElement.type||72!==a.which&&72!=a.keyCode||m.toggleHide()},!1);h.extend(m.prototype,{add:function(a,b){return t(this,a,b,{factoryArgs:Array.prototype.slice.call(arguments,
2)})},addColor:function(a,b){return t(this,a,b,{color:!0})},remove:function(a){this.__ul.removeChild(a.__li);this.__controllers.slice(this.__controllers.indexOf(a),1);var b=this;h.defer(function(){b.onResize()})},destroy:function(){this.autoPlace&&x.removeChild(this.domElement)},addFolder:function(a){if(void 0!==this.__folders[a])throw Error('You already have a folder in this GUI by the name "'+a+'"');var b={name:a,parent:this};b.autoPlace=this.autoPlace;this.load&&this.load.folders&&this.load.folders[a]&&
(b.closed=this.load.folders[a].closed,b.load=this.load.folders[a]);b=new m(b);this.__folders[a]=b;a=u(this,b.domElement);g.addClass(a,"folder");return b},open:function(){this.closed=!1},close:function(){this.closed=!0},onResize:function(){var a=this.getRoot();if(a.scrollable){var b=g.getOffset(a.__ul).top,d=0;h.each(a.__ul.childNodes,function(b){a.autoPlace&&b===a.__save_row||(d+=g.getHeight(b))});window.innerHeight-b-20<d?(g.addClass(a.domElement,m.CLASS_TOO_TALL),a.__ul.style.height=window.innerHeight-
b-20+"px"):(g.removeClass(a.domElement,m.CLASS_TOO_TALL),a.__ul.style.height="auto")}a.__resize_handle&&h.defer(function(){a.__resize_handle.style.height=a.__ul.offsetHeight+"px"});a.__closeButton&&(a.__closeButton.style.width=a.width+"px")},remember:function(){h.isUndefined(A)&&(A=new y,A.domElement.innerHTML=a);if(this.parent)throw Error("You can only call remember on a top level GUI.");var b=this;h.each(Array.prototype.slice.call(arguments),function(a){0==b.__rememberedObjects.length&&K(b);-1==
b.__rememberedObjects.indexOf(a)&&b.__rememberedObjects.push(a)});this.autoPlace&&F(this,this.width)},getRoot:function(){for(var a=this;a.parent;)a=a.parent;return a},getSaveObject:function(){var a=this.load;a.closed=this.closed;0<this.__rememberedObjects.length&&(a.preset=this.preset,a.remembered||(a.remembered={}),a.remembered[this.preset]=B(this));a.folders={};h.each(this.__folders,function(b,d){a.folders[d]=b.getSaveObject()});return a},save:function(){this.load.remembered||(this.load.remembered=
{});this.load.remembered[this.preset]=B(this);D(this,!1)},saveAs:function(a){this.load.remembered||(this.load.remembered={},this.load.remembered[z]=B(this,!0));this.load.remembered[a]=B(this);this.preset=a;E(this,a,!0)},revert:function(a){h.each(this.__controllers,function(b){this.getRoot().load.remembered?v(a||this.getRoot(),b):b.setValue(b.initialValue)},this);h.each(this.__folders,function(a){a.revert(a)});a||D(this.getRoot(),!1)},listen:function(a){var b=0==this.__listening.length;this.__listening.push(a);
b&&G(this.__listening)}});return m}(dat.utils.css,'<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>',
".dg {\n  /** Clear list styles */\n  /* Auto-place container */\n  /* Auto-placed GUI's */\n  /* Line items that don't contain folders. */\n  /** Folder names */\n  /** Hides closed items */\n  /** Controller row */\n  /** Name-half (left) */\n  /** Controller-half (right) */\n  /** Controller placement */\n  /** Shorter number boxes when slider is present. */\n  /** Ensure the entire boolean and function row shows a hand */ }\n  .dg ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    clear: both; }\n  .dg.ac {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 0;\n    z-index: 0; }\n  .dg:not(.ac) .main {\n    /** Exclude mains in ac so that we don't hide close button */\n    overflow: hidden; }\n  .dg.main {\n    -webkit-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .dg.main.taller-than-window {\n      overflow-y: auto; }\n      .dg.main.taller-than-window .close-button {\n        opacity: 1;\n        /* TODO, these are style notes */\n        margin-top: -1px;\n        border-top: 1px solid #2c2c2c; }\n    .dg.main ul.closed .close-button {\n      opacity: 1 !important; }\n    .dg.main:hover .close-button,\n    .dg.main .close-button.drag {\n      opacity: 1; }\n    .dg.main .close-button {\n      /*opacity: 0;*/\n      -webkit-transition: opacity 0.1s linear;\n      -o-transition: opacity 0.1s linear;\n      -moz-transition: opacity 0.1s linear;\n      transition: opacity 0.1s linear;\n      border: 0;\n      position: absolute;\n      line-height: 19px;\n      height: 20px;\n      /* TODO, these are style notes */\n      cursor: pointer;\n      text-align: center;\n      background-color: #000; }\n      .dg.main .close-button:hover {\n        background-color: #111; }\n  .dg.a {\n    float: right;\n    margin-right: 15px;\n    overflow-x: hidden; }\n    .dg.a.has-save > ul {\n      margin-top: 27px; }\n      .dg.a.has-save > ul.closed {\n        margin-top: 0; }\n    .dg.a .save-row {\n      position: fixed;\n      top: 0;\n      z-index: 1002; }\n  .dg li {\n    -webkit-transition: height 0.1s ease-out;\n    -o-transition: height 0.1s ease-out;\n    -moz-transition: height 0.1s ease-out;\n    transition: height 0.1s ease-out; }\n  .dg li:not(.folder) {\n    cursor: auto;\n    height: 27px;\n    line-height: 27px;\n    overflow: hidden;\n    padding: 0 4px 0 5px; }\n  .dg li.folder {\n    padding: 0;\n    border-left: 4px solid rgba(0, 0, 0, 0); }\n  .dg li.title {\n    cursor: pointer;\n    margin-left: -4px; }\n  .dg .closed li:not(.title),\n  .dg .closed ul li,\n  .dg .closed ul li > * {\n    height: 0;\n    overflow: hidden;\n    border: 0; }\n  .dg .cr {\n    clear: both;\n    padding-left: 3px;\n    height: 27px; }\n  .dg .property-name {\n    cursor: default;\n    float: left;\n    clear: left;\n    width: 40%;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .dg .c {\n    float: left;\n    width: 60%; }\n  .dg .c input[type=text] {\n    border: 0;\n    margin-top: 4px;\n    padding: 3px;\n    width: 100%;\n    float: right; }\n  .dg .has-slider input[type=text] {\n    width: 30%;\n    /*display: none;*/\n    margin-left: 0; }\n  .dg .slider {\n    float: left;\n    width: 66%;\n    margin-left: -5px;\n    margin-right: 0;\n    height: 19px;\n    margin-top: 4px; }\n  .dg .slider-fg {\n    height: 100%; }\n  .dg .c input[type=checkbox] {\n    margin-top: 9px; }\n  .dg .c select {\n    margin-top: 5px; }\n  .dg .cr.function,\n  .dg .cr.function .property-name,\n  .dg .cr.function *,\n  .dg .cr.boolean,\n  .dg .cr.boolean * {\n    cursor: pointer; }\n  .dg .selector {\n    display: none;\n    position: absolute;\n    margin-left: -9px;\n    margin-top: 23px;\n    z-index: 10; }\n  .dg .c:hover .selector,\n  .dg .selector.drag {\n    display: block; }\n  .dg li.save-row {\n    padding: 0; }\n    .dg li.save-row .button {\n      display: inline-block;\n      padding: 0px 6px; }\n  .dg.dialogue {\n    background-color: #222;\n    width: 460px;\n    padding: 15px;\n    font-size: 13px;\n    line-height: 15px; }\n\n/* TODO Separate style and structure */\n#dg-new-constructor {\n  padding: 10px;\n  color: #222;\n  font-family: Monaco, monospace;\n  font-size: 10px;\n  border: 0;\n  resize: none;\n  box-shadow: inset 1px 1px 1px #888;\n  word-wrap: break-word;\n  margin: 12px 0;\n  display: block;\n  width: 440px;\n  overflow-y: scroll;\n  height: 100px;\n  position: relative; }\n\n#dg-local-explain {\n  display: none;\n  font-size: 11px;\n  line-height: 17px;\n  border-radius: 3px;\n  background-color: #333;\n  padding: 8px;\n  margin-top: 10px; }\n  #dg-local-explain code {\n    font-size: 10px; }\n\n#dat-gui-save-locally {\n  display: none; }\n\n/** Main type */\n.dg {\n  color: #eee;\n  font: 11px 'Lucida Grande', sans-serif;\n  text-shadow: 0 -1px 0 #111;\n  /** Auto place */\n  /* Controller row, <li> */\n  /** Controllers */ }\n  .dg.main {\n    /** Scrollbar */ }\n    .dg.main::-webkit-scrollbar {\n      width: 5px;\n      background: #1a1a1a; }\n    .dg.main::-webkit-scrollbar-corner {\n      height: 0;\n      display: none; }\n    .dg.main::-webkit-scrollbar-thumb {\n      border-radius: 5px;\n      background: #676767; }\n  .dg li:not(.folder) {\n    background: #1a1a1a;\n    border-bottom: 1px solid #2c2c2c; }\n  .dg li.save-row {\n    line-height: 25px;\n    background: #dad5cb;\n    border: 0; }\n    .dg li.save-row select {\n      margin-left: 5px;\n      width: 108px; }\n    .dg li.save-row .button {\n      margin-left: 5px;\n      margin-top: 1px;\n      border-radius: 2px;\n      font-size: 9px;\n      line-height: 7px;\n      padding: 4px 4px 5px 4px;\n      background: #c5bdad;\n      color: #fff;\n      text-shadow: 0 1px 0 #b0a58f;\n      box-shadow: 0 -1px 0 #b0a58f;\n      cursor: pointer; }\n      .dg li.save-row .button.gears {\n        background: #c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;\n        height: 7px;\n        width: 8px; }\n      .dg li.save-row .button:hover {\n        background-color: #bab19e;\n        box-shadow: 0 -1px 0 #b0a58f; }\n  .dg li.folder {\n    border-bottom: 0; }\n  .dg li.title {\n    padding-left: 16px;\n    background: black url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;\n    cursor: pointer;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2); }\n  .dg .closed li.title {\n    background-image: url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==); }\n  .dg .cr.boolean {\n    border-left: 3px solid #806787; }\n  .dg .cr.function {\n    border-left: 3px solid #e61d5f; }\n  .dg .cr.number {\n    border-left: 3px solid #2fa1d6; }\n    .dg .cr.number input[type=text] {\n      color: #2fa1d6; }\n  .dg .cr.string {\n    border-left: 3px solid #1ed36f; }\n    .dg .cr.string input[type=text] {\n      color: #1ed36f; }\n  .dg .cr.function:hover, .dg .cr.boolean:hover {\n    background: #111; }\n  .dg .c input[type=text] {\n    background: #303030;\n    outline: none; }\n    .dg .c input[type=text]:hover {\n      background: #3c3c3c; }\n    .dg .c input[type=text]:focus {\n      background: #494949;\n      color: #fff; }\n  .dg .c .slider {\n    background: #303030;\n    cursor: ew-resize; }\n  .dg .c .slider-fg {\n    background: #2fa1d6; }\n  .dg .c .slider:hover {\n    background: #3c3c3c; }\n    .dg .c .slider:hover .slider-fg {\n      background: #44abda; }\n",
dat.controllers.factory=function(e,a,b,d,f,c,p){return function(k,l,q,n){var r=k[l];if(p.isArray(q)||p.isObject(q))return new e(k,l,q);if(p.isNumber(r))return p.isNumber(q)&&p.isNumber(n)?new b(k,l,q,n):new a(k,l,{min:q,max:n});if(p.isString(r))return new d(k,l);if(p.isFunction(r))return new f(k,l,"");if(p.isBoolean(r))return new c(k,l)}}(dat.controllers.OptionController,dat.controllers.NumberControllerBox,dat.controllers.NumberControllerSlider,dat.controllers.StringController=function(e,a,b){var d=
function(b,c){function e(){k.setValue(k.__input.value)}d.superclass.call(this,b,c);var k=this;this.__input=document.createElement("input");this.__input.setAttribute("type","text");a.bind(this.__input,"keyup",e);a.bind(this.__input,"change",e);a.bind(this.__input,"blur",function(){k.__onFinishChange&&k.__onFinishChange.call(k,k.getValue())});a.bind(this.__input,"keydown",function(a){13===a.keyCode&&this.blur()});this.updateDisplay();this.domElement.appendChild(this.__input)};d.superclass=e;b.extend(d.prototype,
e.prototype,{updateDisplay:function(){a.isActive(this.__input)||(this.__input.value=this.getValue());return d.superclass.prototype.updateDisplay.call(this)}});return d}(dat.controllers.Controller,dat.dom.dom,dat.utils.common),dat.controllers.FunctionController,dat.controllers.BooleanController,dat.utils.common),dat.controllers.Controller,dat.controllers.BooleanController,dat.controllers.FunctionController,dat.controllers.NumberControllerBox,dat.controllers.NumberControllerSlider,dat.controllers.OptionController,
dat.controllers.ColorController=function(e,a,b,d,f){function c(a,b,d,c){a.style.background="";f.each(l,function(e){a.style.cssText+="background: "+e+"linear-gradient("+b+", "+d+" 0%, "+c+" 100%); "})}function p(a){a.style.background="";a.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";a.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
a.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";a.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";a.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}var k=function(e,n){function r(b){t(b);a.bind(window,"mousemove",t);a.bind(window,
"mouseup",l)}function l(){a.unbind(window,"mousemove",t);a.unbind(window,"mouseup",l)}function g(){var a=d(this.value);!1!==a?(s.__color.__state=a,s.setValue(s.__color.toOriginal())):this.value=s.__color.toString()}function h(){a.unbind(window,"mousemove",u);a.unbind(window,"mouseup",h)}function t(b){b.preventDefault();var d=a.getWidth(s.__saturation_field),c=a.getOffset(s.__saturation_field),e=(b.clientX-c.left+document.body.scrollLeft)/d;b=1-(b.clientY-c.top+document.body.scrollTop)/d;1<b?b=1:0>
b&&(b=0);1<e?e=1:0>e&&(e=0);s.__color.v=b;s.__color.s=e;s.setValue(s.__color.toOriginal());return!1}function u(b){b.preventDefault();var d=a.getHeight(s.__hue_field),c=a.getOffset(s.__hue_field);b=1-(b.clientY-c.top+document.body.scrollTop)/d;1<b?b=1:0>b&&(b=0);s.__color.h=360*b;s.setValue(s.__color.toOriginal());return!1}k.superclass.call(this,e,n);this.__color=new b(this.getValue());this.__temp=new b(0);var s=this;this.domElement=document.createElement("div");a.makeSelectable(this.domElement,!1);
this.__selector=document.createElement("div");this.__selector.className="selector";this.__saturation_field=document.createElement("div");this.__saturation_field.className="saturation-field";this.__field_knob=document.createElement("div");this.__field_knob.className="field-knob";this.__field_knob_border="2px solid ";this.__hue_knob=document.createElement("div");this.__hue_knob.className="hue-knob";this.__hue_field=document.createElement("div");this.__hue_field.className="hue-field";this.__input=document.createElement("input");
this.__input.type="text";this.__input_textShadow="0 1px 1px ";a.bind(this.__input,"keydown",function(a){13===a.keyCode&&g.call(this)});a.bind(this.__input,"blur",g);a.bind(this.__selector,"mousedown",function(b){a.addClass(this,"drag").bind(window,"mouseup",function(b){a.removeClass(s.__selector,"drag")})});var v=document.createElement("div");f.extend(this.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"});f.extend(this.__field_knob.style,
{position:"absolute",width:"12px",height:"12px",border:this.__field_knob_border+(0.5>this.__color.v?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1});f.extend(this.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1});f.extend(this.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"});f.extend(v.style,{width:"100%",height:"100%",
background:"none"});c(v,"top","rgba(0,0,0,0)","#000");f.extend(this.__hue_field.style,{width:"15px",height:"100px",display:"inline-block",border:"1px solid #555",cursor:"ns-resize"});p(this.__hue_field);f.extend(this.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:this.__input_textShadow+"rgba(0,0,0,0.7)"});a.bind(this.__saturation_field,"mousedown",r);a.bind(this.__field_knob,"mousedown",r);a.bind(this.__hue_field,"mousedown",function(b){u(b);a.bind(window,
"mousemove",u);a.bind(window,"mouseup",h)});this.__saturation_field.appendChild(v);this.__selector.appendChild(this.__field_knob);this.__selector.appendChild(this.__saturation_field);this.__selector.appendChild(this.__hue_field);this.__hue_field.appendChild(this.__hue_knob);this.domElement.appendChild(this.__input);this.domElement.appendChild(this.__selector);this.updateDisplay()};k.superclass=e;f.extend(k.prototype,e.prototype,{updateDisplay:function(){var a=d(this.getValue());if(!1!==a){var e=!1;
f.each(b.COMPONENTS,function(b){if(!f.isUndefined(a[b])&&!f.isUndefined(this.__color.__state[b])&&a[b]!==this.__color.__state[b])return e=!0,{}},this);e&&f.extend(this.__color.__state,a)}f.extend(this.__temp.__state,this.__color.__state);this.__temp.a=1;var k=0.5>this.__color.v||0.5<this.__color.s?255:0,l=255-k;f.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toString(),border:this.__field_knob_border+"rgb("+
k+","+k+","+k+")"});this.__hue_knob.style.marginTop=100*(1-this.__color.h/360)+"px";this.__temp.s=1;this.__temp.v=1;c(this.__saturation_field,"left","#fff",this.__temp.toString());f.extend(this.__input.style,{backgroundColor:this.__input.value=this.__color.toString(),color:"rgb("+k+","+k+","+k+")",textShadow:this.__input_textShadow+"rgba("+l+","+l+","+l+",.7)"})}});var l=["-moz-","-o-","-webkit-","-ms-",""];return k}(dat.controllers.Controller,dat.dom.dom,dat.color.Color=function(e,a,b,d){function f(a,
b,d){Object.defineProperty(a,b,{get:function(){if("RGB"===this.__state.space)return this.__state[b];p(this,b,d);return this.__state[b]},set:function(a){"RGB"!==this.__state.space&&(p(this,b,d),this.__state.space="RGB");this.__state[b]=a}})}function c(a,b){Object.defineProperty(a,b,{get:function(){if("HSV"===this.__state.space)return this.__state[b];k(this);return this.__state[b]},set:function(a){"HSV"!==this.__state.space&&(k(this),this.__state.space="HSV");this.__state[b]=a}})}function p(b,c,e){if("HEX"===
b.__state.space)b.__state[c]=a.component_from_hex(b.__state.hex,e);else if("HSV"===b.__state.space)d.extend(b.__state,a.hsv_to_rgb(b.__state.h,b.__state.s,b.__state.v));else throw"Corrupted color state";}function k(b){var c=a.rgb_to_hsv(b.r,b.g,b.b);d.extend(b.__state,{s:c.s,v:c.v});d.isNaN(c.h)?d.isUndefined(b.__state.h)&&(b.__state.h=0):b.__state.h=c.h}var l=function(){this.__state=e.apply(this,arguments);if(!1===this.__state)throw"Failed to interpret color arguments";this.__state.a=this.__state.a||
1};l.COMPONENTS="r g b h s v hex a".split(" ");d.extend(l.prototype,{toString:function(){return b(this)},toOriginal:function(){return this.__state.conversion.write(this)}});f(l.prototype,"r",2);f(l.prototype,"g",1);f(l.prototype,"b",0);c(l.prototype,"h");c(l.prototype,"s");c(l.prototype,"v");Object.defineProperty(l.prototype,"a",{get:function(){return this.__state.a},set:function(a){this.__state.a=a}});Object.defineProperty(l.prototype,"hex",{get:function(){"HEX"!==!this.__state.space&&(this.__state.hex=
a.rgb_to_hex(this.r,this.g,this.b));return this.__state.hex},set:function(a){this.__state.space="HEX";this.__state.hex=a}});return l}(dat.color.interpret,dat.color.math=function(){var e;return{hsv_to_rgb:function(a,b,d){var e=a/60-Math.floor(a/60),c=d*(1-b),p=d*(1-e*b);b=d*(1-(1-e)*b);a=[[d,b,c],[p,d,c],[c,d,b],[c,p,d],[b,c,d],[d,c,p]][Math.floor(a/60)%6];return{r:255*a[0],g:255*a[1],b:255*a[2]}},rgb_to_hsv:function(a,b,d){var e=Math.min(a,b,d),c=Math.max(a,b,d),e=c-e;if(0==c)return{h:NaN,s:0,v:0};
a=(a==c?(b-d)/e:b==c?2+(d-a)/e:4+(a-b)/e)/6;0>a&&(a+=1);return{h:360*a,s:e/c,v:c/255}},rgb_to_hex:function(a,b,d){a=this.hex_with_component(0,2,a);a=this.hex_with_component(a,1,b);return a=this.hex_with_component(a,0,d)},component_from_hex:function(a,b){return a>>8*b&255},hex_with_component:function(a,b,d){return d<<(e=8*b)|a&~(255<<e)}}}(),dat.color.toString,dat.utils.common),dat.color.interpret,dat.utils.common),dat.utils.requestAnimationFrame=function(){return window.webkitRequestAnimationFrame||
window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e,a){window.setTimeout(e,1E3/60)}}(),dat.dom.CenteredDiv=function(e,a){var b=function(){this.backgroundElement=document.createElement("div");a.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear"});e.makeFullscreen(this.backgroundElement);this.backgroundElement.style.position="fixed";this.domElement=
document.createElement("div");a.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear"});document.body.appendChild(this.backgroundElement);document.body.appendChild(this.domElement);var b=this;e.bind(this.backgroundElement,"click",function(){b.hide()})};b.prototype.show=function(){var b=this;this.backgroundElement.style.display="block";this.domElement.style.display="block";this.domElement.style.opacity=
0;this.domElement.style.webkitTransform="scale(1.1)";this.layout();a.defer(function(){b.backgroundElement.style.opacity=1;b.domElement.style.opacity=1;b.domElement.style.webkitTransform="scale(1)"})};b.prototype.hide=function(){var a=this,b=function(){a.domElement.style.display="none";a.backgroundElement.style.display="none";e.unbind(a.domElement,"webkitTransitionEnd",b);e.unbind(a.domElement,"transitionend",b);e.unbind(a.domElement,"oTransitionEnd",b)};e.bind(this.domElement,"webkitTransitionEnd",
b);e.bind(this.domElement,"transitionend",b);e.bind(this.domElement,"oTransitionEnd",b);this.backgroundElement.style.opacity=0;this.domElement.style.opacity=0;this.domElement.style.webkitTransform="scale(1.1)"};b.prototype.layout=function(){this.domElement.style.left=window.innerWidth/2-e.getWidth(this.domElement)/2+"px";this.domElement.style.top=window.innerHeight/2-e.getHeight(this.domElement)/2+"px"};return b}(dat.dom.dom,dat.utils.common),dat.dom.dom,dat.utils.common);
},{}],24:[function(_dereq_,module,exports){
/*! howler.js v2.0.0-beta1 | (c) 2013-2015, James Simpson of GoldFire Studios | MIT License | howlerjs.com */
!function(){"use strict";function e(){try{"undefined"!=typeof AudioContext?n=new AudioContext:"undefined"!=typeof webkitAudioContext?n=new webkitAudioContext:o=!1}catch(e){o=!1}if(!o)if("undefined"!=typeof Audio)try{new Audio}catch(e){t=!0}else t=!0}var n=null,o=!0,t=!1;if(e(),o){var r="undefined"==typeof n.createGain?n.createGainNode():n.createGain();r.gain.value=1,r.connect(n.destination)}var d=function(){this.init()};d.prototype={init:function(){var e=this||u;return e._codecs={},e._howls=[],e._muted=!1,e._volume=1,e.iOSAutoEnable=!0,e.noAudio=t,e.usingWebAudio=o,e.ctx=n,t||e._setupCodecs(),e},volume:function(e){var n=this||u;if(e=parseFloat(e),"undefined"!=typeof e&&e>=0&&1>=e){n._volume=e,o&&(r.gain.value=e);for(var t=0;t<n._howls.length;t++)if(!n._howls[t]._webAudio)for(var d=n._howls[t]._getSoundIds(),a=0;a<d.length;a++){var i=n._howls[t]._soundById(d[a]);i&&i._node&&(i._node.volume=i._volume*e)}return n}return n._volume},mute:function(e){var n=this||u;n._muted=e,o&&(r.gain.value=e?0:n._volume);for(var t=0;t<n._howls.length;t++)if(!n._howls[t]._webAudio)for(var d=n._howls[t]._getSoundIds(),a=0;a<d.length;a++){var i=n._howls[t]._soundById(d[a]);i&&i._node&&(i._node.muted=e?!0:i._muted)}return n},codecs:function(e){return(this||u)._codecs[e]},_setupCodecs:function(){var e=this||u,n=new Audio,o=n.canPlayType("audio/mpeg;").replace(/^no$/,""),t=/OPR\//.test(navigator.userAgent);return e._codecs={mp3:!(t||!o&&!n.canPlayType("audio/mp3;").replace(/^no$/,"")),mpeg:!!o,opus:!!n.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),ogg:!!n.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),wav:!!n.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),aac:!!n.canPlayType("audio/aac;").replace(/^no$/,""),m4a:!!(n.canPlayType("audio/x-m4a;")||n.canPlayType("audio/m4a;")||n.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(n.canPlayType("audio/x-mp4;")||n.canPlayType("audio/mp4;")||n.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!n.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,""),webm:!!n.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")},e},_enableiOSAudio:function(){var e=this||u;if(!n||!e._iOSEnabled&&/iPhone|iPad|iPod/i.test(navigator.userAgent)){e._iOSEnabled=!1;var o=function(){var t=n.createBuffer(1,1,22050),r=n.createBufferSource();r.buffer=t,r.connect(n.destination),"undefined"==typeof r.start?r.noteOn(0):r.start(0),setTimeout(function(){(r.playbackState===r.PLAYING_STATE||r.playbackState===r.FINISHED_STATE)&&(e._iOSEnabled=!0,e.iOSAutoEnable=!1,document.removeEventListener("touchend",o,!1))},0)};return document.addEventListener("touchend",o,!1),e}}};var u=new d,a=function(e){var n=this;return e.src&&0!==e.src.length?void n.init(e):void console.error("An array of source files must be passed with any new Howl.")};a.prototype={init:function(e){var t=this;return t._autoplay=e.autoplay||!1,t._ext=e.ext||null,t._html5=e.html5||!1,t._muted=e.mute||!1,t._loop=e.loop||!1,t._pool=e.pool||5,t._preload="boolean"==typeof e.preload?e.preload:!0,t._rate=e.rate||1,t._sprite=e.sprite||{},t._src="string"!=typeof e.src?e.src:[e.src],t._volume=void 0!==e.volume?e.volume:1,t._duration=0,t._loaded=!1,t._sounds=[],t._endTimers={},t._onend=e.onend?[{fn:e.onend}]:[],t._onfaded=e.onfaded?[{fn:e.onfaded}]:[],t._onload=e.onload?[{fn:e.onload}]:[],t._onloaderror=e.onloaderror?[{fn:e.onloaderror}]:[],t._onpause=e.onpause?[{fn:e.onpause}]:[],t._onplay=e.onplay?[{fn:e.onplay}]:[],t._onstop=e.onstop?[{fn:e.onstop}]:[],t._webAudio=o&&!t._html5,"undefined"!=typeof n&&n&&u.iOSAutoEnable&&u._enableiOSAudio(),u._howls.push(t),t._preload&&t.load(),t},load:function(){var e=this,n=null;if(t)return void e._emit("loaderror");"string"==typeof e._src&&(e._src=[e._src]);for(var o=0;o<e._src.length;o++){var r,d;if(e._ext&&e._ext[o]?r=e._ext[o]:(d=e._src[o],r=/^data:audio\/([^;,]+);/i.exec(d),r||(r=/\.([^.]+)$/.exec(d.split("?",1)[0])),r&&(r=r[1].toLowerCase())),u.codecs(r)){n=e._src[o];break}}return n?(e._src=n,new i(e),e._webAudio&&s(e),e):void e._emit("loaderror")},play:function(e){var o=this,t=arguments,r=null;if("number"==typeof e)r=e,e=null;else if("undefined"==typeof e){e="__default";for(var d=0,a=0;a<o._sounds.length;a++)o._sounds[a]._paused&&!o._sounds[a]._ended&&(d++,r=o._sounds[a]._id);1===d?e=null:r=null}var i=r?o._soundById(r):o._inactiveSound();if(!i)return null;if(r&&!e&&(e=i._sprite||"__default"),!o._loaded&&!o._sprite[e])return o.once("load",function(){o.play(o._soundById(i._id)?i._id:void 0)}),i._id;if(r&&!i._paused)return i._id;var _=i._seek>0?i._seek:o._sprite[e][0]/1e3,s=(o._sprite[e][0]+o._sprite[e][1])/1e3-_,l=1e3*s/Math.abs(i._rate);o._endTimers[i._id]=setTimeout(o._ended.bind(o,i),l),i._paused=!1,i._ended=!1,i._sprite=e,i._seek=_,i._start=o._sprite[e][0]/1e3,i._stop=(o._sprite[e][0]+o._sprite[e][1])/1e3,i._loop=!(!i._loop&&!o._sprite[e][2]);var f=i._node;if(o._webAudio){var c=function(){o._refreshBuffer(i);var e=i._muted||o._muted?0:i._volume*u.volume();f.gain.setValueAtTime(e,n.currentTime),i._playStart=n.currentTime,"undefined"==typeof f.bufferSource.start?i._loop?f.bufferSource.noteGrainOn(0,_,86400):f.bufferSource.noteGrainOn(0,_,s):i._loop?f.bufferSource.start(0,_,86400):f.bufferSource.start(0,_,s),o._endTimers[i._id]||(o._endTimers[i._id]=setTimeout(o._ended.bind(o,i),l)),t[1]||setTimeout(function(){o._emit("play",i._id)},0)};o._loaded?c():(o.once("load",c),o._clearTimer(i._id))}else{var p=function(){f.currentTime=_,f.muted=i._muted||o._muted||u._muted||f.muted,f.volume=i._volume*u.volume(),f.playbackRate=i._rate,setTimeout(function(){f.play(),t[1]||o._emit("play",i._id)},0)};if(4===f.readyState||!f.readyState&&navigator.isCocoonJS)p();else{var m=function(){o._endTimers[i._id]=setTimeout(o._ended.bind(o,i),l),p(),f.removeEventListener("canplaythrough",m,!1)};f.addEventListener("canplaythrough",m,!1),o._clearTimer(i._id)}}return i._id},pause:function(e){var n=this;if(!n._loaded)return n.once("play",function(){n.pause(e)}),n;for(var o=n._getSoundIds(e),t=0;t<o.length;t++){n._clearTimer(o[t]);var r=n._soundById(o[t]);if(r&&!r._paused){if(r._seek=n.seek(o[t]),r._paused=!0,n._webAudio){if(!r._node.bufferSource)return n;"undefined"==typeof r._node.bufferSource.stop?r._node.bufferSource.noteOff(0):r._node.bufferSource.stop(0),r._node.bufferSource=null}else isNaN(r._node.duration)||r._node.pause();arguments[1]||n._emit("pause",r._id)}}return n},stop:function(e){var n=this;if(!n._loaded)return"undefined"!=typeof n._sounds[0]._sprite&&n.once("play",function(){n.stop(e)}),n;for(var o=n._getSoundIds(e),t=0;t<o.length;t++){n._clearTimer(o[t]);var r=n._soundById(o[t]);if(r&&!r._paused){if(r._seek=r._start||0,r._paused=!0,r._ended=!0,n._webAudio&&r._node){if(!r._node.bufferSource)return n;"undefined"==typeof r._node.bufferSource.stop?r._node.bufferSource.noteOff(0):r._node.bufferSource.stop(0),r._node.bufferSource=null}else r._node&&!isNaN(r._node.duration)&&(r._node.pause(),r._node.currentTime=r._start||0);n._emit("stop",r._id)}}return n},mute:function(e,o){var t=this;if(!t._loaded)return t.once("play",function(){t.mute(e,o)}),t;if("undefined"==typeof o){if("boolean"!=typeof e)return t._muted;t._muted=e}for(var r=t._getSoundIds(o),d=0;d<r.length;d++){var a=t._soundById(r[d]);a&&(a._muted=e,t._webAudio&&a._node?a._node.gain.setValueAtTime(e?0:a._volume*u.volume(),n.currentTime):a._node&&(a._node.muted=u._muted?!0:e))}return t},volume:function(){var e,o,t=this,r=arguments;if(0===r.length)return t._volume;if(1===r.length){var d=t._getSoundIds(),a=d.indexOf(r[0]);a>=0?o=parseInt(r[0],10):e=parseFloat(r[0])}else 2===r.length&&(e=parseFloat(r[0]),o=parseInt(r[1],10));var i;if(!("undefined"!=typeof e&&e>=0&&1>=e))return i=o?t._soundById(o):t._sounds[0],i?i._volume:0;if(!t._loaded)return t.once("play",function(){t.volume.apply(t,r)}),t;"undefined"==typeof o&&(t._volume=e),o=t._getSoundIds(o);for(var _=0;_<o.length;_++)i=t._soundById(o[_]),i&&(i._volume=e,t._webAudio&&i._node&&!i._muted?i._node.gain.setValueAtTime(e*u.volume(),n.currentTime):i._node&&!i._muted&&(i._node.volume=e*u.volume()));return t},fade:function(e,o,t,r){var d=this;if(!d._loaded)return d.once("play",function(){d.fade(e,o,t,r)}),d;d.volume(e,r);for(var u=d._getSoundIds(r),a=0;a<u.length;a++){var i=d._soundById(u[a]);if(i)if(d._webAudio&&!i._muted){var _=n.currentTime,s=_+t/1e3;i._volume=e,i._node.gain.setValueAtTime(e,_),i._node.gain.linearRampToValueAtTime(o,s),setTimeout(function(e,t){setTimeout(function(){t._volume=o,d._emit("faded",e)},s-n.currentTime>0?Math.ceil(1e3*(s-n.currentTime)):0)}.bind(d,u[a],i),t)}else{var l=Math.abs(e-o),f=e>o?"out":"in",c=l/.01,p=t/c;!function(){var n=e,t=setInterval(function(e){n+="in"===f?.01:-.01,n=Math.max(0,n),n=Math.min(1,n),n=Math.round(100*n)/100,d.volume(n,e),n===o&&(clearInterval(t),d._emit("faded",e))}.bind(d,u[a]),p)}()}}return d},loop:function(){var e,n,o,t=this,r=arguments;if(0===r.length)return t._loop;if(1===r.length){if("boolean"!=typeof r[0])return o=t._soundById(parseInt(r[0],10)),o?o._loop:!1;e=r[0],t._loop=e}else 2===r.length&&(e=r[0],n=parseInt(r[1],10));for(var d=t._getSoundIds(n),u=0;u<d.length;u++)o=t._soundById(d[u]),o&&(o._loop=e,t._webAudio&&o._node&&o._node.bufferSource&&(o._node.bufferSource.loop=e));return t},rate:function(){var e,n,o=this,t=arguments;if(0===t.length)n=o._sounds[0]._id;else if(1===t.length){var r=o._getSoundIds(),d=r.indexOf(t[0]);d>=0?n=parseInt(t[0],10):e=parseFloat(t[0])}else 2===t.length&&(e=parseFloat(t[0]),n=parseInt(t[1],10));var u;if("number"!=typeof e)return u=o._soundById(n),u?u._rate:o._rate;if(!o._loaded)return o.once("load",function(){o.rate.apply(o,t)}),o;"undefined"==typeof n&&(o._rate=e),n=o._getSoundIds(n);for(var a=0;a<n.length;a++)if(u=o._soundById(n[a])){u._rate=e,o._webAudio&&u._node&&u._node.bufferSource?u._node.bufferSource.playbackRate.value=e:u._node&&(u._node.playbackRate=e);var i=o.seek(n[a]),_=(o._sprite[u._sprite][0]+o._sprite[u._sprite][1])/1e3-i,s=1e3*_/Math.abs(u._rate);o._clearTimer(n[a]),o._endTimers[n[a]]=setTimeout(o._ended.bind(o,u),s)}return o},seek:function(){var e,o,t=this,r=arguments;if(0===r.length)o=t._sounds[0]._id;else if(1===r.length){var d=t._getSoundIds(),u=d.indexOf(r[0]);u>=0?o=parseInt(r[0],10):(o=t._sounds[0]._id,e=parseFloat(r[0]))}else 2===r.length&&(e=parseFloat(r[0]),o=parseInt(r[1],10));if("undefined"==typeof o)return t;if(!t._loaded)return t.once("load",function(){t.seek.apply(t,r)}),t;var a=t._soundById(o);if(a){if(!(e>=0))return t._webAudio?a._seek+(t.playing(o)?n.currentTime-a._playStart:0):a._node.currentTime;var i=t.playing(o);i&&t.pause(o,!0),a._seek=e,t._clearTimer(o),i&&t.play(o,!0)}return t},playing:function(e){var n=this,o=n._soundById(e)||n._sounds[0];return o?!o._paused:!1},duration:function(){return this._duration},unload:function(){for(var e=this,n=e._sounds,o=0;o<n.length;o++){n[o]._paused||(e.stop(n[o]._id),e._emit("end",n[o]._id)),e._webAudio||(n[o]._node.src="",n[o]._node.removeEventListener("error",n[o]._errorFn,!1),n[o]._node.removeEventListener("canplaythrough",n[o]._loadFn,!1)),delete n[o]._node,e._clearTimer(n[o]._id);var t=u._howls.indexOf(e);t>=0&&u._howls.splice(t,1)}return _&&delete _[e._src],e=null,null},on:function(e,n,o,t){var r=this,d=r["_on"+e];return"function"==typeof n&&d.push(t?{id:o,fn:n,once:t}:{id:o,fn:n}),r},off:function(e,n,o){var t=this,r=t["_on"+e];if(n){for(var d=0;d<r.length;d++)if(n===r[d].fn&&o===r[d].id){r.splice(d,1);break}}else t["on"+e]=[];return t},once:function(e,n,o){var t=this;return t.on(e,n,o,1),t},_emit:function(e,n,o){for(var t=this,r=t["_on"+e],d=0;d<r.length;d++)r[d].id&&r[d].id!==n||(setTimeout(function(e){e.call(this,n,o)}.bind(t,r[d].fn),0),r[d].once&&t.off(e,r[d].fn,n));return t},_ended:function(e){var o=this,t=e._sprite,r=!(!e._loop&&!o._sprite[t][2]);if(o._emit("end",e._id),!o._webAudio&&r&&o.stop(e._id).play(e._id),o._webAudio&&r){o._emit("play",e._id),e._seek=e._start||0,e._playStart=n.currentTime;var d=1e3*(e._stop-e._start)/Math.abs(e._rate);o._endTimers[e._id]=setTimeout(o._ended.bind(o,e),d)}return o._webAudio&&!r&&(e._paused=!0,e._ended=!0,e._seek=e._start||0,o._clearTimer(e._id),e._node.bufferSource=null),o._webAudio||r||o.stop(e._id),o},_clearTimer:function(e){var n=this;return n._endTimers[e]&&(clearTimeout(n._endTimers[e]),delete n._endTimers[e]),n},_soundById:function(e){for(var n=this,o=0;o<n._sounds.length;o++)if(e===n._sounds[o]._id)return n._sounds[o];return null},_inactiveSound:function(){var e=this;e._drain();for(var n=0;n<e._sounds.length;n++)if(e._sounds[n]._ended)return e._sounds[n].reset();return new i(e)},_drain:function(){var e=this,n=e._pool,o=0,t=0;if(!(e._sounds.length<n)){for(t=0;t<e._sounds.length;t++)e._sounds[t]._ended&&o++;for(t=e._sounds.length-1;t>=0;t--){if(n>=o)return;e._sounds[t]._ended&&(e._webAudio&&e._sounds[t]._node&&e._sounds[t]._node.disconnect(0),e._sounds.splice(t,1),o--)}}},_getSoundIds:function(e){var n=this;if("undefined"==typeof e){for(var o=[],t=0;t<n._sounds.length;t++)o.push(n._sounds[t]._id);return o}return[e]},_refreshBuffer:function(e){var o=this;return e._node.bufferSource=n.createBufferSource(),e._node.bufferSource.buffer=_[o._src],e._node.bufferSource.connect(e._panner?e._panner:e._node),e._node.bufferSource.loop=e._loop,e._loop&&(e._node.bufferSource.loopStart=e._start||0,e._node.bufferSource.loopEnd=e._stop),e._node.bufferSource.playbackRate.value=o._rate,o}};var i=function(e){this._parent=e,this.init()};if(i.prototype={init:function(){var e=this,n=e._parent;return e._muted=n._muted,e._loop=n._loop,e._volume=n._volume,e._muted=n._muted,e._rate=n._rate,e._seek=0,e._paused=!0,e._ended=!0,e._id=Math.round(Date.now()*Math.random()),n._sounds.push(e),e.create(),e},create:function(){var e=this,o=e._parent,t=u._muted||e._muted||e._parent._muted?0:e._volume*u.volume();return o._webAudio?(e._node="undefined"==typeof n.createGain?n.createGainNode():n.createGain(),e._node.gain.setValueAtTime(t,n.currentTime),e._node.paused=!0,e._node.connect(r)):(e._node=new Audio,e._errorFn=e._errorListener.bind(e),e._node.addEventListener("error",e._errorFn,!1),e._loadFn=e._loadListener.bind(e),e._node.addEventListener("canplaythrough",e._loadFn,!1),e._node.src=o._src,e._node.preload="auto",e._node.volume=t,e._node.load()),e},reset:function(){var e=this,n=e._parent;return e._muted=n._muted,e._loop=n._loop,e._volume=n._volume,e._muted=n._muted,e._rate=n._rate,e._seek=0,e._paused=!0,e._ended=!0,e._sprite=null,e._id=Math.round(Date.now()*Math.random()),e},_errorListener:function(){var e=this;e._node.error&&4===e._node.error.code&&(u.noAudio=!0),e._parent._emit("loaderror",e._id,e._node.error?e._node.error.code:0),e._node.removeEventListener("error",e._errorListener,!1)},_loadListener:function(){var e=this,n=e._parent;n._duration=Math.ceil(10*e._node.duration)/10,0===Object.keys(n._sprite).length&&(n._sprite={__default:[0,1e3*n._duration]}),n._loaded||(n._loaded=!0,n._emit("load")),n._autoplay&&n.play(),e._node.removeEventListener("canplaythrough",e._loadFn,!1)}},o)var _={},s=function(e){var n=e._src;if(_[n])return e._duration=_[n].duration,void c(e);if(/^data:[^;]+;base64,/.test(n)){window.atob=window.atob||function(e){for(var n,o,t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",r=String(e).replace(/=+$/,""),d=0,u=0,a="";o=r.charAt(u++);~o&&(n=d%4?64*n+o:o,d++%4)?a+=String.fromCharCode(255&n>>(-2*d&6)):0)o=t.indexOf(o);return a};for(var o=atob(n.split(",")[1]),t=new Uint8Array(o.length),r=0;r<o.length;++r)t[r]=o.charCodeAt(r);f(t.buffer,e)}else{var d=new XMLHttpRequest;d.open("GET",n,!0),d.responseType="arraybuffer",d.onload=function(){f(d.response,e)},d.onerror=function(){e._webAudio&&(e._html5=!0,e._webAudio=!1,e._sounds=[],delete _[n],e.load())},l(d)}},l=function(e){try{e.send()}catch(n){e.onerror()}},f=function(e,o){n.decodeAudioData(e,function(e){e&&(_[o._src]=e,c(o,e))},function(){o._emit("loaderror")})},c=function(e,n){n&&!e._duration&&(e._duration=n.duration),0===Object.keys(e._sprite).length&&(e._sprite={__default:[0,1e3*e._duration]}),e._loaded||(e._loaded=!0,e._emit("load")),e._autoplay&&e.play()};"function"==typeof define&&define.amd&&define("howler",function(){return{Howler:u,Howl:a}}),"undefined"!=typeof exports&&(exports.Howler=u,exports.Howl=a),"undefined"!=typeof window&&(window.HowlerGlobal=d,window.Howler=u,window.Howl=a,window.Sound=i)}();
/*! Effects Plugin */
!function(){"use strict";HowlerGlobal.prototype.init=function(e){return function(){var n=this;return n._pos=[0,0,0],n._orientation=[0,0,-1,0,1,0],n._velocity=[0,0,0],n._listenerAttr={dopplerFactor:1,speedOfSound:343.3},e.call(this,o)}}(HowlerGlobal.prototype.init),HowlerGlobal.prototype.pos=function(e,n,t){var o=this;return o.ctx&&o.ctx.listener?(n="number"!=typeof n?o._pos[1]:n,t="number"!=typeof t?o._pos[2]:t,"number"!=typeof e?o._pos:(o._pos=[e,n,t],o.ctx.listener.setPosition(o._pos[0],o._pos[1],o._pos[2]),o)):o},HowlerGlobal.prototype.orientation=function(e,n,t,o,r,i){var a=this;if(!a.ctx||!a.ctx.listener)return a;var p=a._orientation;return n="number"!=typeof n?p[1]:n,t="number"!=typeof t?p[2]:t,o="number"!=typeof o?p[3]:o,r="number"!=typeof r?p[4]:r,i="number"!=typeof i?p[5]:i,"number"!=typeof e?p:(a._orientation=[e,n,t,o,r,i],a.ctx.listener.setOrientation(p[0],p[1],p[2],p[3],p[4],p[5]),a)},HowlerGlobal.prototype.velocity=function(e,n,t){var o=this;return o.ctx&&o.ctx.listener?(n="number"!=typeof n?o._velocity[1]:n,t="number"!=typeof t?o._velocity[2]:t,"number"!=typeof e?o._velocity:(o._velocity=[e,n,t],o.ctx.listener.setVelocity(o._velocity[0],o._velocity[1],o._velocity[2]),o)):o},HowlerGlobal.prototype.listenerAttr=function(e){var n=this;if(!n.ctx||!n.ctx.listener)return n;var t=n._listenerAttr;return e?(n._listenerAttr={dopplerFactor:"undefined"!=typeof e.dopplerFactor?e.dopplerFactor:t.dopplerFactor,speedOfSound:"undefined"!=typeof e.speedOfSound?e.speedOfSound:t.speedOfSound},n.ctx.listener.dopplerFactor=t.dopplerFactor,n.ctx.listener.speedOfSound=t.speedOfSound,n):t},Howl.prototype.init=function(e){return function(n){var t=this;return t._orientation=n.orientation||[1,0,0],t._pos=n.pos||null,t._velocity=n.velocity||[0,0,0],t._pannerAttr={coneInnerAngle:"undefined"!=typeof n.coneInnerAngle?n.coneInnerAngle:360,coneOUterAngle:"undefined"!=typeof n.coneOUterAngle?n.coneOUterAngle:360,coneOuterGain:"undefined"!=typeof n.coneOuterGain?n.coneOuterGain:0,distanceModel:"undefined"!=typeof n.distanceModel?n.distanceModel:"inverse",maxDistance:"undefined"!=typeof n.maxDistance?n.maxDistance:1e4,panningModel:"undefined"!=typeof n.panningModel?n.panningModel:"HRTF",refDistance:"undefined"!=typeof n.refDistance?n.refDistance:1,rolloffFactor:"undefined"!=typeof n.rolloffFactor?n.rolloffFactor:1},e.call(this,n)}}(Howl.prototype.init),Howl.prototype.pos=function(n,t,o,r){var i=this;if(!i._webAudio)return i;if(!i._loaded)return i.once("play",function(){i.pos(n,t,o,r)}),i;if(t="number"!=typeof t?0:t,o="number"!=typeof o?-.5:o,"undefined"==typeof r){if("number"!=typeof n)return i._pos;i._pos=[n,t,o]}for(var a=i._getSoundIds(r),p=0;p<a.length;p++){var l=i._soundById(a[p]);if(l){if("number"!=typeof n)return l._pos;l._pos=[n,t,o],l._node&&(l._panner||e(l),l._panner.setPosition(n,t,o))}}return i},Howl.prototype.orientation=function(n,t,o,r){var i=this;if(!i._webAudio)return i;if(!i._loaded)return i.once("play",function(){i.orientation(n,t,o,r)}),i;if(t="number"!=typeof t?i._orientation[1]:t,o="number"!=typeof o?i._orientation[1]:o,"undefined"==typeof r){if("number"!=typeof n)return i._orientation;i._orientation=[n,t,o]}for(var a=i._getSoundIds(r),p=0;p<a.length;p++){var l=i._soundById(a[p]);if(l){if("number"!=typeof n)return l._orientation;l._orientation=[n,t,o],l._node&&(l._panner||e(l),l._panner.setOrientation(n,t,o))}}return i},Howl.prototype.velocity=function(n,t,o,r){var i=this;if(!i._webAudio)return i;if(!i._loaded)return i.once("play",function(){i.velocity(n,t,o,r)}),i;if(t="number"!=typeof t?i._velocity[1]:t,o="number"!=typeof o?i._velocity[1]:o,"undefined"==typeof r){if("number"!=typeof n)return i._velocity;i._velocity=[n,t,o]}for(var a=i._getSoundIds(r),p=0;p<a.length;p++){var l=i._soundById(a[p]);if(l){if("number"!=typeof n)return l._velocity;l._velocity=[n,t,o],l._node&&(l._panner||e(l),l._panner.setVelocity(n,t,o))}}return i},Howl.prototype.pannerAttr=function(){var n,t,o,r=this,i=arguments;if(!r._webAudio)return r;if(0===i.length)return r._pannerAttr;if(1===i.length){if("object"!=typeof i[0])return o=r._soundById(parseInt(i[0],10)),o?o._pannerAttr:r._pannerAttr;n=i[0],"undefined"==typeof t&&(r._pannerAttr={coneInnerAngle:"undefined"!=typeof n.coneInnerAngle?n.coneInnerAngle:r._coneInnerAngle,coneOUterAngle:"undefined"!=typeof n.coneOUterAngle?n.coneOUterAngle:r._coneOUterAngle,coneOuterGain:"undefined"!=typeof n.coneOuterGain?n.coneOuterGain:r._coneOuterGain,distanceModel:"undefined"!=typeof n.distanceModel?n.distanceModel:r._distanceModel,maxDistance:"undefined"!=typeof n.maxDistance?n.maxDistance:r._maxDistance,panningModel:"undefined"!=typeof n.panningModel?n.panningModel:r._panningModel,refDistance:"undefined"!=typeof n.refDistance?n.refDistance:r._refDistance,rolloffFactor:"undefined"!=typeof n.rolloffFactor?n.rolloffFactor:r._rolloffFactor})}else 2===i.length&&(n=i[0],t=parseInt(i[1],10));for(var a=r._getSoundIds(t),p=0;p<a.length;p++)if(o=r._soundById(a[p])){var l=o._pannerAttr;l={coneInnerAngle:"undefined"!=typeof n.coneInnerAngle?n.coneInnerAngle:l.coneInnerAngle,coneOUterAngle:"undefined"!=typeof n.coneOUterAngle?n.coneOUterAngle:l.coneOUterAngle,coneOuterGain:"undefined"!=typeof n.coneOuterGain?n.coneOuterGain:l.coneOuterGain,distanceModel:"undefined"!=typeof n.distanceModel?n.distanceModel:l.distanceModel,maxDistance:"undefined"!=typeof n.maxDistance?n.maxDistance:l.maxDistance,panningModel:"undefined"!=typeof n.panningModel?n.panningModel:l.panningModel,refDistance:"undefined"!=typeof n.refDistance?n.refDistance:l.refDistance,rolloffFactor:"undefined"!=typeof n.rolloffFactor?n.rolloffFactor:l.rolloffFactor};var c=o._panner;c?(c.coneInnerAngle=l.coneInnerAngle,c.coneOUterAngle=l.coneOUterAngle,c.coneOuterGain=l.coneOuterGain,c.distanceModel=l.distanceModel,c.maxDistance=l.maxDistance,c.panningModel=l.panningModel,c.refDistance=l.refDistance,c.rolloffFactor=l.rolloffFactor):(o._pos||(o._pos=r._pos||[0,0,-.5]),e(o))}return r},Sound.prototype.init=function(e){return function(){var n=this,t=n._parent;n._orientation=t._orientation,n._pos=t._pos,n._velocity=t._velocity,n._pannerAttr=t._pannerAttr,e.call(this),n._pos&&t.pos(n._pos[0],n._pos[1],n._pos[2],n._id)}}(Sound.prototype.init),Sound.prototype.reset=function(e){return function(){var n=this,t=n._parent;return n._orientation=t._orientation,n._pos=t._pos,n._velocity=t._velocity,n._pannerAttr=t._pannerAttr,e.call(this)}}(Sound.prototype.reset);var e=function(e){e._panner=Howler.ctx.createPanner(),e._panner.coneInnerAngle=e._pannerAttr.coneInnerAngle,e._panner.coneOUterAngle=e._pannerAttr.coneOUterAngle,e._panner.coneOuterGain=e._pannerAttr.coneOuterGain,e._panner.distanceModel=e._pannerAttr.distanceModel,e._panner.maxDistance=e._pannerAttr.maxDistance,e._panner.panningModel=e._pannerAttr.panningModel,e._panner.refDistance=e._pannerAttr.refDistance,e._panner.rolloffFactor=e._pannerAttr.rolloffFactor,e._panner.setPosition(e._pos[0],e._pos[1],e._pos[2]),e._panner.setOrientation(e._orientation[0],e._orientation[1],e._orientation[2]),e._panner.setVelocity(e._velocity[0],e._velocity[1],e._velocity[2]),e._panner.connect(e._node),e._paused||e._parent.pause(e._id).play(e._id)}}();
},{}],25:[function(_dereq_,module,exports){
// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){function f(a,e,b){a=document.createElement(a);a.id=e;a.style.cssText=b;return a}function l(a,e,b){var c=f("div",a,"padding:0 0 3px 3px;text-align:left;background:"+b),d=f("div",a+"Text","font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px;color:"+e);d.innerHTML=a.toUpperCase();c.appendChild(d);a=f("div",a+"Graph","width:74px;height:30px;background:"+e);c.appendChild(a);for(e=0;74>e;e++)a.appendChild(f("span","","width:1px;height:30px;float:left;opacity:0.9;background:"+
b));return c}function m(a){for(var b=c.children,d=0;d<b.length;d++)b[d].style.display=d===a?"block":"none";n=a}function p(a,b){a.appendChild(a.firstChild).style.height=Math.min(30,30-30*b)+"px"}var q=self.performance&&self.performance.now?self.performance.now.bind(performance):Date.now,k=q(),r=k,t=0,n=0,c=f("div","stats","width:80px;opacity:0.9;cursor:pointer");c.addEventListener("mousedown",function(a){a.preventDefault();m(++n%c.children.length)},!1);var d=0,u=Infinity,v=0,b=l("fps","#0ff","#002"),
A=b.children[0],B=b.children[1];c.appendChild(b);var g=0,w=Infinity,x=0,b=l("ms","#0f0","#020"),C=b.children[0],D=b.children[1];c.appendChild(b);if(self.performance&&self.performance.memory){var h=0,y=Infinity,z=0,b=l("mb","#f08","#201"),E=b.children[0],F=b.children[1];c.appendChild(b)}m(n);return{REVISION:14,domElement:c,setMode:m,begin:function(){k=q()},end:function(){var a=q();g=a-k;w=Math.min(w,g);x=Math.max(x,g);C.textContent=(g|0)+" MS ("+(w|0)+"-"+(x|0)+")";p(D,g/200);t++;if(a>r+1E3&&(d=Math.round(1E3*
t/(a-r)),u=Math.min(u,d),v=Math.max(v,d),A.textContent=d+" FPS ("+u+"-"+v+")",p(B,d/100),r=a,t=0,void 0!==h)){var b=performance.memory.usedJSHeapSize,c=performance.memory.jsHeapSizeLimit;h=Math.round(9.54E-7*b);y=Math.min(y,h);z=Math.max(z,h);E.textContent=h+" MB ("+y+"-"+z+")";p(F,b/c)}return a},update:function(){k=this.end()}}};"object"===typeof module&&(module.exports=Stats);

},{}]},{},[15])
(15)
});