/******************************************************************************
 * game.js
 *
 * @package gameturf
 *****************************************************************************/

(function() {

/*global require, module */

var settings                  = require('./settings')
var input                     = require('./input')
var theatre                   = require('./theatre')
var world                     = require('./../systems/world')
var ui                        = require('./ui')
var entityCollisionDetection  = require('./../detectors/entityCollisionDetection')
var entityManager             = require('./../managers/entityManager')
var worldCollsitionDetection  = require('./../detectors/worldCollsitionDetection')
var wind                      = require('./../systems/wind')
var sound                     = require('./sound')
var Stats                     = require('../../vendors/stats.min')

/**
 *  This is the heart of the game engine. It conotains the functions to 
 *  start and stop the engine, it beholds the powerful game loop!
 *
 *  @dev Maybe make access to these functions easer. Insteat of
 *       Gameturf.game.init() make it Gameturf.init(). 
 */ 
var game = {

    /**
     *  Gets current running state of the engine.
     *  
     *  @public
     *  @type {boolean}
     */
    isRunning              : false

    /**
     *  
     */
  , showStats              : false

    /**
     *  
     */
  , init: function() {
      if (game.showStats) game.statsSetup()

      theatre.init(settings.theatreMovesWithPlayer)

      ui.init(function(){
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
    }

    /**
     *  
     */
  , loop: function(){
      if (game.isRunning) {

        if (game.showStats) game.stats.begin()

        game.update()
        game.postUpdate()
        game.preDraw()
        game.draw()

        if (game.showStats) game.stats.end()

        requestAnimationFrame(game.loop)
      }
    }

    /**
     *  
     */
  , update: function(){
      wind.update()
      worldCollsitionDetection.update()
      entityManager.update()
      entityCollisionDetection.update()
    }

    /**
     *  
     */
  , postUpdate: function(){
      entityManager.postUpdate()
    }

    /**
     *  
     */
  , preDraw:function(){
      entityManager.preDraw()
      theatre.clearStage()
      theatre.preShake()
    }

    /**
     *  
     */
  , draw: function(){
      entityManager.draw()

      if (settings.theatreMovesWithPlayer) world.draw();

      if (theatre.worldNeedsRedraw){
        theatre.clearWorld()
        world.draw()
        theatre.worldNeedsRedraw = false
      }

      worldCollsitionDetection.draw()
      wind.draw()
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
