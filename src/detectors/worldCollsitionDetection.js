/******************************************************************************
 * worldCollsitionDetection.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */
  
var tilesHelper = require('./../helpers/tilesHelper')
var theatre     = require('./../core/theatre')
var sound       = require('./../core/sound')
var settings    = require('./../core/settings')
var physicsHelper = require('./../helpers/physicsHelper')

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
