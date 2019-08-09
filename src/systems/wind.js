/******************************************************************************
 * wind.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var util                = require('./../core/util')
var WindParticleFactory = require('./WindParticleFactory')

var wind = {

    windParticles        : []
  , windDirection        : { x: 1, y:0 }
  , windSpeed            : 4
  , maxAliveWindPartiles : 10

  , init: function(){
      for (var i = 0; i < 10; i++) {
        wind.windParticles.push(WindParticleFactory())
      }
    }

  , incluenceEntityPhysic: function(physics, moveDirectionVector){
      if (Math.random() > 0.5) {
        moveDirectionVector.x += (wind.windDirection.x * (1 / physics.mass)) / 1000
        moveDirectionVector.y += (wind.windDirection.y * (1 / physics.mass)) / 1000
      }
    }

  , update: function(timeElapsed){

      if (Math.random()>0.995){
        wind.windSpeed = (Math.random() * 9) + 1
      }

      if (Math.random()>0.95) {
        wind.windDirection.x = Math.random() - 0.5 + wind.windDirection.x
        wind.windDirection.y = Math.random() - 0.5 + wind.windDirection.y
        util.setVectorToLengthOne(wind.windDirection)
      }

      if(Math.random() > (0.995 - (wind.windSpeed/100))) {
        for (var i = 0; i < wind.maxAliveWindPartiles; i++) {
          if (!wind.windParticles[i].isAlive){
            wind.windParticles[i].birth()
            break
          }
        }
      }

      for (var i = 0; i < wind.maxAliveWindPartiles; i++){
        if (wind.windParticles[i].isAlive){
          wind.windParticles[i].update(timeElapsed, wind.windDirection, wind.windSpeed)
        }
      }
    }

  , draw: function(timeElapsed){
      for (var i = 0; i < wind.maxAliveWindPartiles; i++){
        if (wind.windParticles[i].isAlive){
          wind.windParticles[i].draw(timeElapsed)
        }
      }
    }
}

wind.init()

module.exports = wind

}())
