/******************************************************************************
 * face.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */
  
var theatre = require('./../core/theatre')
var util    = require('./../core/util')

module.exports = function(config){

  config = config || {}

  var face = {

      color                   : config.color || "#B0A183"
    , defaultFace             : undefined
    , currentFace             : undefined
    , faceExpressionDuration  : 200
    , faceExpressionStartTime : 0
    , positions               : undefined
    , leftEyePosition         : { x: 0, y: 0 }
    , rightEyePosition        : { x: 0, y: 0 }
    , mouthPosition           : { x: 0, y: 0 }
    , compareVector           : { x: 0, y:-1 }
    , eyeSize                 : 0
    , mouthCloseSize          : 0
    , mouthOpenSize           : 0

    , init: function(width){
        face.defaultFace    = face.drawNoramlFace
        face.currentFace    = face.drawNoramlFace
        face.eyeSize        = width * 0.2
        face.mouthOpenSize  = width * 0.2
        face.mouthCloseSize = width * 0.4
      }

    , addToDatGuiFolder: function(folder) {
        var faceFolder = folder.addFolder("Face")
        faceFolder.add(face, "faceExpressionDuration")
        faceFolder.add(face, "faceExpressionStartTime").listen()
      }

    , update: function(physics, isInteracting){

        if (physics.collsition)  {

          face.SetSurpiseFace()

        } else if (physics.isMoving) {

          if (face.faceExpressionStartTime) {

          } else if(isInteracting){

            var lookAngle = util.getVectorAngleDegree(face.compareVector, physics.velocity)

            if (lookAngle > -30 && lookAngle < 30) {
              face.SetFaceLookTop()
            } else if (lookAngle > 150 && lookAngle < 210){
              face.SetFaceLookDown()
            } else if (lookAngle < 180 && lookAngle > 2){
              face.SetFaceLookRight()
            } else if (lookAngle < -2 ||  lookAngle > 2 && lookAngle != 180){
              face.SetFaceLookLeft()
            }
          }
        }

        if (face.faceExpressionStartTime) {
          if (Date.now() - face.faceExpressionStartTime > face.faceExpressionDuration) {
            face.currentFace             = face.drawNoramlFace
            face.faceExpressionStartTime = undefined
          }
        }

        if (Math.random() > 0.995) {
          face.setNoramlFaceOpenEyes()
        }
      }

    , draw: function(physics) {
        face.currentFace(physics)
      }

      // Setter

    , SetSurpiseFace: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawSurpiseFace
      }

    , SetFaceLookLeft: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawFaceLookLeft
      }

    , SetFaceLookRight: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawFaceLookRight
      }

    , SetFaceLookTop: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawFaceLookTop
      }

    , SetFaceLookDown: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawFaceLookDown
      }

    , setNoramlFaceOpenEyes: function(){
        face.faceExpressionStartTime = Date.now()
        face.currentFace             = face.drawNoramlFaceOpenEyes
      }

      // Draw Face
    , drawNoramlFace: function(physics) {

        // left eye
        face.leftEyePosition.x = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y = physics.position.y - (physics.height * 0.1)
        theatre.drawLine(
          'stage'
        , face.leftEyePosition
        , face.eyeSize
        , face.color)

        // right eye
        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.1)
        theatre.drawLine(
          'stage'
        , face.rightEyePosition
        , face.eyeSize
        , face.color)

        // close mouth
        face.mouthPosition.x = physics.position.x - (physics.width  * 0.2)
        face.mouthPosition.y = physics.position.y + (physics.height * 0.3)
        theatre.drawLine(
          'stage'
        , face.mouthPosition
        , face.mouthCloseSize
        , face.color)
      }

    , drawNoramlFaceOpenEyes: function(physics) {
        // linkes auge
        face.leftEyePosition.x = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y = physics.position.y - (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.leftEyePosition
        , face.eyeSize
        , face.color)

        // rechtes auge
        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.rightEyePosition
        , face.eyeSize
        , face.color)

        // closed mund
        face.mouthPosition.x = physics.position.x - (physics.width  * 0.2)
        face.mouthPosition.y = physics.position.y + (physics.height * 0.3)
        theatre.drawLine(
          'stage'
        , face.mouthPosition
        , face.mouthCloseSize
        , face.color)
      }

    , drawSurpiseFace: function(physics){
        // linkes auge
        face.leftEyePosition.x = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y = physics.position.y - (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.leftEyePosition
        , face.eyeSize
        , face.color)

        // rechtes auge
        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.rightEyePosition
        , face.eyeSize
        , face.color)

        // mund
        face.mouthPosition.x = physics.position.x - (physics.width  * 0.1)
        face.mouthPosition.y = physics.position.y + (physics.height * 0.2)
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.mouthPosition
        , face.mouthOpenSize
        , face.color)
      }

    , drawFaceLookLeft: function(physics){

        face.leftEyePosition.x  = physics.position.x - (physics.width  * 0.4)
        face.leftEyePosition.y  = physics.position.y - (physics.height * 0.2)

        face.rightEyePosition.x = physics.position.x
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.2)

        face.drawFaceLook(physics)
      }

    , drawFaceLookRight: function(physics){

        face.leftEyePosition.x  = physics.position.x - (physics.width  * 0.2)
        face.leftEyePosition.y  = physics.position.y - (physics.height * 0.2)

        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.2)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.2)

        face.drawFaceLook(physics)
      }

    , drawFaceLookTop: function(physics){

        face.leftEyePosition.x  = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y  = physics.position.y - (physics.height * 0.25)

        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.25)

        face.drawFaceLook(physics)
      }

    , drawFaceLookDown: function(physics){

        face.leftEyePosition.x  = physics.position.x - (physics.width  * 0.3)
        face.leftEyePosition.y  = physics.position.y - (physics.height * 0.15)

        face.rightEyePosition.x = physics.position.x + (physics.width  * 0.1)
        face.rightEyePosition.y = physics.position.y - (physics.height * 0.15)

        face.drawFaceLook(physics)
      }

    , drawFaceLook: function(physics){

        var shake   = physics.isRunning ? 2 : 1.1
          , offsetX = (Math.random() - 0.5) * shake
          , offsetY = (Math.random() - 0.5) * shake

        face.leftEyePosition.x  += offsetX
        face.leftEyePosition.y  += offsetY

        face.rightEyePosition.x += offsetX
        face.rightEyePosition.y += offsetY

        // linkes auge
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.leftEyePosition
        , face.eyeSize
        , face.color)

        // rechtes auge
        theatre.drawSquareFromLeftTopCorner(
          'stage'
        , face.rightEyePosition
        , face.eyeSize
        , face.color)

        // close mouth
        face.mouthPosition.x = physics.position.x - (physics.width  * 0.2) + offsetX
        face.mouthPosition.y = physics.position.y + (physics.height * 0.3) + offsetY

        theatre.drawLine(
          'stage'
        , face.mouthPosition
        , face.mouthCloseSize
        , face.color)
      }
    }

  return face
}

}());
