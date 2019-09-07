/******************************************************************************
 * gameTurf.js
 *
 * 
 *****************************************************************************/

 (function() {

/*global require, module */

var tilesHelper               = require('./../helpers/tilesHelper')
var worldCollisionDetection  = require('./../detectors/worldCollisionDetection')

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
      return worldCollisionDetection.collsitionDetection(
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
        timeElapsed
      , world.map
      , world.mapWithTileTypes
      , world.worldWith
      , world.wolrdHeight)
    }
};

module.exports =  world

}())
