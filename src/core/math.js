/******************************************************************************
 * math.js
 *
 * 
 *****************************************************************************/

(function() {

/*global module */
  
/**
 *  
 */ 
var math = {
    
    /**
     *  Subtracts a 2-dimensional vector from another vector.
     */
    vectorSubstract: function (vector1, vector2) {
      return {
        x: vector1.x - vector2.x
      , y: vector1.y - vector2.y
      }
    }
}

module.exports =  math

}());
