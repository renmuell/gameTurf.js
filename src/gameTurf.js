/******************************************************************************
 * gameTurf.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

module.exports = {

    settings : require('./core/settings')
,   input    : require('./core/input')
,   theatre  : require('./core/theatre')
,   ui       : require('./core/ui')
,   sound    : require('./core/sound')
,   util     : require('./core/util')
,   game     : require('./core/game')
,   face     : require('./entityPlugins/face')
,   physics  : require('./entityPlugins/physics')
,   wind     : require('./systems/wind')
,   math     : require('./core/math')
,   world    :  require('./systems/world')
,   lastPositions : require('./entityPlugins/lastPositions')
,   entityManager : require('./managers/entityManager')
,   entityCollisionDetection : require('./detectors/entityCollisionDetection')
}

}())
