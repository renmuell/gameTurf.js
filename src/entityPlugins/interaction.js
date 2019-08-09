/**
 * interaction.js
 *
 */

(function() {

    /*global require, module */

    module.exports = function(settings){
    
      settings = settings || {}
    
      var interaction = {
        
        onInteraction: settings.onInteraction || function (entity) {

        },
        
        drawHighlightBox: settings.drawHighlightBox || function () {

        }
      }
    
      return interaction
    }
    
    }());
    