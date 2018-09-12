/******************************************************************************
 * physics.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var util      = require('./../core/util')
var world     = require('./../systems/world')
var settings  = require('./../core/settings')
var theatre   = require('./../core/theatre')

module.exports = function(config){

  config = config || {}

  var physics = {

      x                 : config.x                 || 0
    , y                 : config.y                 || 0
    , velocity          : config.velocity          || { x:0, y:0 }
    , speed             : config.speed             || 2
    , runSpeed          : config.runSpeed          || 4
    , mass              : config.mass              || 1
    , height            : config.height            || 20
    , width             : config.width             || 20
    , isBounce          : config.isBounce          || false
    , isFrictionless    : config.isFrictionless    != undefined ? config.isFrictionless : false
    , frictionMagnitude : config.frictionMagnitude || 0.5
    , canWorldColide    : config.canWorldColide    != undefined ? config.canWorldColide : true

    , isMoving     : false
    , angle        : 0
    , maxVelocity  : undefined
    , halfWidth    : undefined
    , halfHeight   : undefined
    , isRunning    : false
    , collsition   : false
    , hitBox       : undefined
    , currentSpeed : 0

    , init: function(){
        physics.createHitBox()
        physics.halfHeight = physics.height/2
        physics.halfWidth  = physics.width/2
      }

    , addToDatGuiFolder: function(folder){
        var physicsFolder = folder.addFolder("Physics")
        physicsFolder.add(physics, "speed")
        physicsFolder.add(physics, "runSpeed")
        physicsFolder.add(physics, "isBounce")
        physicsFolder.add(physics, "angle")
        physicsFolder.add(physics, "mass")
        physicsFolder.add(physics, "currentSpeed").listen()
        physicsFolder.add(physics, "isFrictionless")
        physicsFolder.add(physics, "frictionMagnitude")
        physicsFolder.add(physics, "x").listen()
        physicsFolder.add(physics, "y").listen()
        physicsFolder.add(physics, "collsition").listen()
        physicsFolder.add(physics, "isMoving").listen()
        physicsFolder.add(physics, "isRunning").listen()
        physicsFolder.add(physics.velocity, "x").listen()
        physicsFolder.add(physics.velocity, "y").listen()
      }

    , calculateFriction: function(){
        if (!physics.isFrictionless) {
          if (physics.currentSpeed  > 0.1)
            physics.lowerVelocityTo(physics.currentSpeed - physics.frictionMagnitude)
          else
            physics.setVelocity(0, 0)
        }
      }

    , inputUpdate: function(input){
        if (input) {
          physics.isRunning = input.isRunning
          physics.maxVelocity = physics.isRunning ? physics.runSpeed : physics.speed

          physics.addVelocity(input.vector.x * (physics.maxVelocity/2), input.vector.y * (physics.maxVelocity/2))

          if (physics.currentSpeed > physics.maxVelocity)
            physics.lowerVelocityTo(physics.maxVelocity)
          else if (physics.currentSpeed < 0.2)
            physics.setVelocity(0, 0)
        }
      }

    , update: function(input){
        physics.isMoving    = false
        physics.collsition  = false

        physics.calculateFriction()
        physics.inputUpdate(input)

        if (physics.currentSpeed > 0) {

          physics.isMoving = true

          physics.collsition = physics.collsitionDetection()

          physics.x += physics.velocity.x
          physics.y += physics.velocity.y
        }
      }

    , draw: function(){
        if (settings.physicsDebugMode) physics.drawDebugInfo()
      }

    , createHitBox: function(){
        physics.hitBox = {
            centerPosition: {}
          , Left          : undefined
          , Right         : undefined
          , Bottom        : undefined
          , Top           : undefined
          , points        : [
              { x: undefined, y: undefined }
            , { x: undefined, y: undefined }
            , { x: undefined, y: undefined }
            , { x: undefined, y: undefined }
          ]
        }
      }

    , getHitBox: function() {
        physics.hitBox.centerPosition.x = physics.x
        physics.hitBox.centerPosition.y = physics.y

        physics.hitBox.Left   = physics.x - physics.halfWidth
        physics.hitBox.Right  = physics.x + physics.halfWidth
        physics.hitBox.Bottom = physics.y + physics.halfHeight
        physics.hitBox.Top    = physics.y - physics.halfHeight

        physics.hitBox.points[0].x = physics.hitBox.Left
        physics.hitBox.points[0].y = physics.hitBox.Top

        physics.hitBox.points[1].x = physics.hitBox.Left
        physics.hitBox.points[1].y = physics.hitBox.Bottom

        physics.hitBox.points[2].x = physics.hitBox.Right
        physics.hitBox.points[2].y = physics.hitBox.Top

        physics.hitBox.points[3].x = physics.hitBox.Right
        physics.hitBox.points[3].y = physics.hitBox.Bottom

        return physics.hitBox
      }

    , collsitionDetection: function(){
        if (physics.canWorldColide) {
          return world.collsitionDetection(
            physics.getHitBox()
          , physics.velocity
          , physics.isBounce)
        }
        return false
      }

    , drawDebugInfo: function(){
        theatre.drawLineWithVector(
            'stage'
          , physics
          , {
                x: physics.velocity.x * 20
              , y: physics.velocity.y * 20
            }
          , "red")
      }

    , addVelocity: function(valueX, valueY) {
        physics.velocity.x += valueX
        physics.velocity.y += valueY
        physics.calculateSpeed()
      }

    , setVelocity: function(valueX, valueY){
        physics.velocity.x = valueX
        physics.velocity.y = valueY
        physics.calculateSpeed()
      }

    , lowerVelocityTo: function(value){
        util.shrinkVectorToLength(physics.velocity, value)
        physics.calculateSpeed()
      }

    , calculateSpeed: function(){
        physics.currentSpeed = util.vectorLength(physics.velocity)
      }
  }

  physics.init()

  return physics
}

}());
