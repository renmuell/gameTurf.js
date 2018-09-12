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
      mapWithTileTypes
    , worldWith
    , wolrdHeight
    , hitbox
    , velocity
    , isBounce){

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
                      tilesHelper.neahrestTileWalls[tileNr][tileWallNr]
                      , hitbox
                      , velocity
                      , isBounce) || colide
          }
        }
      }

      return colide
    }

    /**
     *  
     */ 
  , calculateWallCollsitionDenfung: function(
      wall
    , hitbox
    , velocity
    , isBounce) {

      for (var i = hitbox.points.length - 1; i >= 0; i--) {

        if(worldCollsitionDetection.checkLineIntersectionFast(
              wall[0].x
            , wall[0].y
            , wall[1].x
            , wall[1].y
            , hitbox.points[i].x
            , hitbox.points[i].y
            , hitbox.points[i].x + velocity.x
            , hitbox.points[i].y + velocity.y)){

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

          if (isBounce) {

            if (wallIsRight && velocity.x > 0) velocity.x = -velocity.x
            if (wallIsLeft  && velocity.x < 0) velocity.x = -velocity.x
            if (wallIsDown  && velocity.y > 0) velocity.y = -velocity.y
            if (wallIsUp    && velocity.y < 0) velocity.y = -velocity.y

          } else {

            if (wallIsRight || wallIsLeft) velocity.x = 0
            if (wallIsDown  || wallIsUp)   velocity.y = 0

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
  , update: function(){
      if(settings.debugWorldCollisions) {
        worldCollsitionDetection.collsitions = []
        worldCollsitionDetection.checkLines  = []
      }
    }

    /**
     *  
     */ 
  , draw: function(){
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
