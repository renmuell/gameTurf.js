/******************************************************************************
 * sound.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var Howl = require('../../vendors/howler.min')
var settings = require('./settings')
var Howl = Howl.Howl;

/**
 *  
 */ 
var sound = {

    /**
     *  
     */ 
    effects               : {}

    /**
     *  
     */ 
  , backgroundSong        : undefined

    /**
     *  
     */ 
  , init: function(){

      if (settings.soundEngineOn) {

        if (settings.effects) {
          settings.effects.forEach(function(effect){
            sound.addEffect(effect.id, effect.src , effect.volume)
          })
        }

        if (settings.alloweBackgroundMusic
         && settings.backgroundSong.src) {
         
          sound.backgroundSong = new Howl({
              src   : [setting.backgroundSong.src]
            , loop  : true
            , volume: setting.backgroundSong.volume
          })
        }
      }
    }

    /**
     *  
     */ 
  , addEffect: function(name, file, volume){
      sound.effects[name] = sound.createEffect(
          file
        , volume * settings.effectMusicVolume)
    }

    /**
     *  
     */ 
  , createEffect: function(file, volume){

      var effect = {
          isPlaying : false
        , howl      : new Howl({
            src   : [file]
          , volume: volume
          , onend : function(){
              effect.isPlaying = false
            }
          })
        , play: function(onlyIfNotPlaying){

            if(onlyIfNotPlaying && effect.isPlaying) {
              return
            }

            effect.isPlaying = true
            effect.howl.play()
          }
        }

      return effect
    }

    /**
     *  
     */ 
  , playEffect: function(name, onlyIfNotPlaying){
      if (settings.soundEngineOn) {
        var effect = sound.effects[name]
        if (effect) {
          effect.play(onlyIfNotPlaying)
        }
      }
    }

    /**
     *  
     */ 
  , playBackgroundSound: function(){
      if (settings.alloweBackgroundMusic) {
        sound.backgroundSong.play()
      }
    }

    /**
     *  
     */ 
  , pauseBackgroundSound: function(){
      if (settings.alloweBackgroundMusic) {
        sound.backgroundSong.pause()
      }
    }
}

module.exports = sound

}());
