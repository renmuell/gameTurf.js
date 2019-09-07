/**
 * physicsHelper.js
 *
 */

(function() {

    /*global require, module */
    
    var settings  = require('./../core/settings')
    
    var physicsHelper = {

        

        /**
         * velocity 1 -> 100px pro Sekunde: 100 px/s
         * @param {*} timeElapsed 
         * @param {*} velocityDirection 
         */
        calculateVelocityForTime: function (timeElapsed, velocityDirection) {
            return Math.round(((timeElapsed/10) * velocityDirection)*1000)/1000;
        }
    }
    
    module.exports = physicsHelper
    
}());
