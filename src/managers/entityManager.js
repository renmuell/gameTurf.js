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
var QuadTree = QuadTree.QuadTree;

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

  , update: function(){

      entityManager.visableEntities = entityManager.tree.retrieveInBounds({
        x      : theatre.canvasBoxLeft
      , y      : theatre.canvasBoxTop
      , width  : theatre.canvasWidth
      , height : theatre.canvasHeight
      })

      for (var y = entityManager.enitites.length - 1; y >= 0; y--) {
        entityManager.enitites[y].update()
      }

      entityManager.tree.clear();
      for (var i = entityManager.enitites.length - 1; i >= 0; i--) {
        entityManager.tree.insert(entityManager.enitites[i].physics)
      }
    }

  , postUpdate: function(){
      for (var i = entityManager.enitites.length - 1; i >= 0; i--) {
        if (entityManager.enitites[i].postUpdate) {
          entityManager.enitites[i].postUpdate()
        }
      }
    }
  
  , preDraw: function(){
      for (var i = entityManager.visableEntities.length - 1; i >= 0; i--) {
        var id = entityManager.visableEntities[i].id
        if (entityManager.enitites[id].preDraw) {
          entityManager.enitites[id].preDraw()
        }
      }
    }

  , draw: function(){
      for (var i = entityManager.visableEntities.length - 1; i >= 0; i--) {
        var id = entityManager.visableEntities[i].id
        entityManager.enitites[id].draw()
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
          x: entity.physics.x - checkEntity.physics.x
        , y: entity.physics.y - checkEntity.physics.y
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
