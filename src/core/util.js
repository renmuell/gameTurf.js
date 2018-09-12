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
