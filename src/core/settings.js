/**
 * settings.js
 *
 * @package gameturfjs
 */

(function() {

/*global module */

/**
 *  
 */ 
module.exports = {

    /**
     *  
     */ 
    tileSize              : 50

    /**
     *  
     */ 
  , datGuiIsOn            : true

    /**
     *  
     */ 
  , physicsDebugMode      : false

    /**
     *  
     */ 
  , debugWorldCollisions  : false

    /**
     *  
     */ 
  , soundEngineOn         : true

    /**
     *  
     */ 
  , allowBackgroundMusic : false

    /**
     *  
     */ 
  , effectMusicVolume     : .2

    /**
     *  
     */
  , theatreMovesWithPlayer : true

    /**
     *  
     */
  , effects : []

    /**
     *  
     */
  , backgroundSong: {
      src: undefined,
      volume: 1
    }
}

}());
