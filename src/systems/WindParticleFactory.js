/******************************************************************************
 * windParticleFactory.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var theatre       = require('./../core/theatre')
var Physics       = require('./../entityPlugins/physics')
var LastPositions = require('./../entityPlugins/lastPositions')
var sound         = require('./../core/sound')
var physicsHelper = require('./../helpers/physicsHelper')
var ui            = require('./../core/ui')

if (ui.datGui) {
  var windParticles = ui.datGui.addFolder("WindParticles")
}  

var WindParticleFactory = function(id){

  var WindParticle = {
      Id: id
    , type: 'WindParticle'
    , physics: Physics({
        position: {
          x : 0
        , y : 0
        }
      , height         : 5
      , width          : 5
      , canWorldColide : false
      })
    , lastPositions: LastPositions({
        shouldDrawBodies: false
      , color: {
          r: 255
        , g: 255
        , b: 255
        }
      })
    , isAlive               : false
    , lifeTime              : 1500
    , createdTime           : undefined
    , movementDirectionData : {
        isRunning   : false
      , vector      : { x: 0, y: 0 }
      }

    , birth: function(){
        WindParticle.createdTime = Date.now()
        WindParticle.isAlive     = true
        sound.playEffect('wind')
        WindParticle.physics.position.x = theatre.canvasBoxLeft + (Math.random() * theatre.stageCanvas.width)
        WindParticle.physics.position.y = theatre.canvasBoxTop  + (Math.random() * theatre.stageCanvas.height)
      }

    , update: function(timeElapsed, windDirection, windSpeed){

        var currentLifeTime = Date.now() - WindParticle.createdTime

        if(currentLifeTime > WindParticle.lifeTime){

          WindParticle.isAlive = false
          WindParticle.lastPositions.clear()
        
        } else {
          // value between -1 and 1
          var currentLifeTimeNormal = (currentLifeTime / (WindParticle.lifeTime / 2)) - 1
          // negative quatraic function for high middle value and low start/end points
          var setTimeDelay = ((-1 * Math.pow(currentLifeTimeNormal, 2) + 1) * 150)

          WindParticle.lastPositions.lineWidth    = ((setTimeDelay) / 150) * 2
          WindParticle.lastPositions.setTimeDelay = setTimeDelay

          WindParticle.lastPositions.update(WindParticle.physics)

          WindParticle.physics.speed = windSpeed

          WindParticle.movementDirectionData.vector.x = (Math.random() - 0.5 + windDirection.x)
          WindParticle.movementDirectionData.vector.y = (Math.random() - 0.5 + windDirection.y)

          WindParticle.physics.update(timeElapsed, WindParticle.movementDirectionData)
        }
      }

      , draw: function(timeElapsed){

        WindParticle.lastPositions.draw(WindParticle.physics)
        /*
        var currentLifeTime = Date.now() - WindParticle.createdTime

        // value between -1 and 1
        var currentLifeTimeNormal = (currentLifeTime/(WindParticle.lifeTime/2)) - 1

        // negative quatraic function for high middle value and low start/end points
        var opacity = ((-1 * Math.pow(currentLifeTimeNormal, 2)) + 1)
        */
      }
  }
  
  if (ui.datGui) {
    var datGuiFolder = windParticles.addFolder("WindParticle - " + WindParticle.Id)
    ui.datGui.remember(WindParticle)
    datGuiFolder.add(WindParticle, "isAlive").listen()
    datGuiFolder.add(WindParticle, "lifeTime").listen()
    //datGuiFolder.add(WindParticle, "createdTime")
    datGuiFolder.add(WindParticle, "type")

    datGuiFolder.add(WindParticle.movementDirectionData.vector, "x").listen()
    datGuiFolder.add(WindParticle.movementDirectionData.vector, "y").listen()
    datGuiFolder.add(WindParticle.movementDirectionData, "isRunning").listen()

    WindParticle.lastPositions.addToDatGuiFolder(datGuiFolder)
    WindParticle.physics.addToDatGuiFolder(datGuiFolder)
  }

  return WindParticle
}

module.exports =  WindParticleFactory

}())
