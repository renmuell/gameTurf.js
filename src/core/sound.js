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

        sound.addEffect('colide' , "sounds/jump.ogg"  , .03)
        sound.addEffect('hello'  , "sounds/hello.ogg" , .03)
        sound.addEffect('walk'   , "sounds/walk.ogg"  ,  .7)
        sound.addEffect('running', "sounds/walk.ogg"  ,   1)
        sound.addEffect('wind'   , "sounds/breath.ogg",  .4)

        if (settings.alloweBackgroundMusic) {
          sound.backgroundSong = new Howl({
              src   : ['sounds/inside.mp3']
            , loop  : true
            , volume: settings.backgroundMusicVolume
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

sound.init()

module.exports = sound

}());
