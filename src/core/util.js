/**
 * util.js
 *
 * @package gameturfjs
 */

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
      return util.vectorToRadiant(vector) * 180 / Math.PI
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
  , vectorDistanz: function (vector1, vector2) {
    return Math.sqrt(Math.pow(vector2.x - vector1.x, 2) + Math.pow(vector2.y - vector1.y, 2))
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
      return Math.atan2(vector2.x - vector1.x, vector2.y - vector1.y) * 180 / Math.PI
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

    /**
     *  
     */ 
  , getPositionByDegree: function(position, degree, radius){
      degree = degree * Math.PI / 180
      return {
        x: Math.round(radius * Math.sin(degree)) + position.x
      , y: Math.round(radius * Math.cos(degree)) + position.y
     }
  }
}

module.exports = util

}());
