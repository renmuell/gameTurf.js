/**
 * game.js
 *
 * @package gameturfjs
 */

(function() {

/*global require, module */

var settings                  = require('./settings')
var input                     = require('./input')
var theatre                   = require('./theatre')
var world                     = require('./../systems/world')
var ui                        = require('./ui')
var entityCollisionDetection  = require('./../detectors/entityCollisionDetection')
var entityManager             = require('./../managers/entityManager')
var worldCollisionDetection   = require('./../detectors/worldCollisionDetection')
var wind                      = require('./../systems/wind')
var sound                     = require('./sound')
var Stats                     = require('../../vendors/stats.min')

/**
 *  This is the heart of the game engine. It contains the functions to 
 *  start and stop the engine, it beholds the powerful game loop!
 *
 *  @dev Maybe make access to these functions easer. Instead of
 *       GameTurf.game.init() make it GameTurf.init(). 
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
        delta = 0; // discard the un-simulated time
        // ... snap the player to the authoritative state
    }

  , step: function(){
      game.update(game.timestep)
      game.postUpdate(game.timestep)
      game.preDraw(game.timestep)
      game.draw(game.timestep);
    }

    /**
     *  
     */
  , update: function(delta){
      wind.update(delta)
      worldCollisionDetection.update(delta)
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

      worldCollisionDetection.draw(delta)
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
  datGuiFolder.add(game, "stepTimeThen").listen()
  datGuiFolder.add(game, "stepTimeNow").listen()
  datGuiFolder.add(game, "stepTimeElapsed").listen()
  datGuiFolder.add(game, "timestep").listen()
  datGuiFolder.add(game, "maxFPS").listen()
  datGuiFolder.add(game, "isRunning").listen()
  datGuiFolder.add(game, "fps").listen()
  datGuiFolder.add(game, "framesThisSecond").listen()
  datGuiFolder.add(game, "lastFpsUpdate").listen()
  datGuiFolder.add(game, "showStats")
}

module.exports = game

}());
