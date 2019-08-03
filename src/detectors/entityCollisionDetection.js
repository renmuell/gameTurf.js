/******************************************************************************
 * entityCollisionDetection.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var entityManager = require('./../managers/entityManager')

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
, update: function(){

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
