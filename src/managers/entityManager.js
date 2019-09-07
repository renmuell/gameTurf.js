/******************************************************************************
 * entityManager.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var QuadTree  = require('../../vendors/QuadTree')
var theatre   = require('../core/theatre')
var util      = require('../core/util')
QuadTree = QuadTree.QuadTree;

var entityManager = {

    entities        : []
  , visibleEntities : []
  , tree            : new QuadTree({
      x      : 0
    , y      : 0
    , width  : 14000
    , height : 13000
    })

  , add: function(entity){
      var nextIndex                     = entityManager.entities.length
      entity.Id                         = nextIndex
      entity.physics.id                 = nextIndex
      entityManager.entities[nextIndex] = entity
    }

  , update: function(timeElapsed){

      entityManager.visibleEntities = entityManager.tree.retrieveInBounds({
        x      : theatre.canvasBoxLeft
      , y      : theatre.canvasBoxTop
      , width  : theatre.canvasWidth
      , height : theatre.canvasHeight
      })

      for (var y = entityManager.entities.length - 1; y >= 0; y--) {
        entityManager.entities[y].update(timeElapsed)
      }

      entityManager.tree.clear();
      for (var i = entityManager.entities.length - 1; i >= 0; i--) {
        entityManager.entities[i].physics.position.id = entityManager.entities[i].physics.id
        entityManager.tree.insert(entityManager.entities[i].physics.position)
      }
    }

  , postUpdate: function(timeElapsed){
      for (var i = entityManager.entities.length - 1; i >= 0; i--) {
        if (entityManager.entities[i].postUpdate) {
          entityManager.entities[i].postUpdate(timeElapsed)
        }
      }
    }
  
  , preDraw: function(timeElapsed){
      for (var i = entityManager.visibleEntities.length - 1; i >= 0; i--) {
        var id = entityManager.visibleEntities[i].id
        if (entityManager.entities[id].preDraw) {
          entityManager.entities[id].preDraw(timeElapsed)
        }
      }
    }

  , draw: function(timeElapsed){
      for (var i = entityManager.visibleEntities.length - 1; i >= 0; i--) {
        var id = entityManager.visibleEntities[i].id
        entityManager.entities[id].draw(timeElapsed)
      }
    }

  , getNeahrestEntity: function(entity, maxRange){

      maxRange =  maxRange || 0

      var neahrestEnitty
      var neahrestEnittyDistance = Number.MAX_SAFE_INTEGER

      for (var y = entityManager.visibleEntities.length - 1; y >= 0; y--) {
        var checkEntityId = entityManager.visibleEntities[y].id
        var checkEntity   = entityManager.entities[checkEntityId]

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
