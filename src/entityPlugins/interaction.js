/**
 * interaction.js
 *
 */

(function() {

    /*global require, module */

    module.exports = function(settings){
    
      settings = settings || {}
    
      var interaction = {
        
          canInteract: true

        , onInteraction: settings.onInteraction || function (entity) {

          }
        
        , drawHighlightBox: settings.drawHighlightBox || function () {

          }

        , update: function (entity) {
          // get nearest entities

          // call interact
        } 
      }
    
      return interaction
    }
    
    }());
    