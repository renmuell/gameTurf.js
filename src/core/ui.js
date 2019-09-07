/**
 * ui.js
 *
 * @package gameturfjs
 */

(function() {

/*global window, require, module */

var settings  = require('./settings')

/**
 *  
 */ 
var ui = {

  /**
   *  
   */ 
  menu  : document.getElementById("Menu")

, theatre: undefined

  /**
   *  
   */ 
, continueBtn  : document.getElementById("continue")

, bubbleList: []

  /**
   *  
   */ 
, datGui: settings.datGuiIsOn && window.dat ? new window.dat.GUI() : undefined    

, init: function(theatre, continueGameCallback){

    ui.theatre = theatre

    ui.output              = document.getElementById('output');
    ui.output.style.width  = ui.theatre.canvasWidth  + "px";
    ui.output.style.height = ui.theatre.canvasHeight + "px";
    ui.output.style.position = 'absolute';
    ui.output.style.left = 0;
    ui.output.style.top = 0;
    ui.output.style.pointerEvents = "none";
    ui.output.style.zIndex = 1000;

    ui.continueBtn.addEventListener('click', function(){
      continueGameCallback();
    })
  }

, update: function(timeElapsed) {



  ui.bubbleList.forEach(function(bubble) {

    bubble.time -= timeElapsed;

    if (bubble.time <= 0) {
      bubble.element.remove();
      bubble.death = true;
    } else {
      ui.setBubblePosition(bubble.element, bubble.physics);
    }
  })

  ui.bubbleList = ui.bubbleList.filter(function (bubble) {
    return !bubble.death;
  });
}

, draw: function(timeElapsed) {
  
}

  /**
   *  
   */ 
, openMenu: function(){
    ui.menu.className = ""
  }

  /**
   *  
   */ 
, closeMenu: function(){
    ui.menu.className = "hide"
  }

, setBubblePosition: function (element, physics) {
  if (ui.theatre.useResolutionDivider) {
    element.style.top = (((ui.theatre.canvasBoxTop*ui.theatre.resolutionDivider)*-1) + (physics.position.y*ui.theatre.resolutionDivider) -(80)) + "px"
    element.style.left = ((((ui.theatre.canvasBoxLeft*ui.theatre.resolutionDivider)*-1) + (physics.position.x*ui.theatre.resolutionDivider)) -(100)) + "px"
  } else {
    element.style.top = ((ui.theatre.canvasBoxTop*-1) + (physics.position.y)) *  ui.theatre.scale  -80 + "px"
    element.style.left = (((ui.theatre.canvasBoxLeft*-1) + physics.position.x)) * ui.theatre.scale -100+ "px"
  }

}
, showBubble: function (physics, text, time) {

    var element = document.createElement("div");
    element.innerHTML = text;
    element.style.position = "absolute"
    element.classList = "bubble";
    element.style.height = "60px";
    element.style.lineHeight = "60px";
    element.style.width = "200px";
    element.style.backgroundColor = "rgba(255,255,255,.3)"
    element.style.textAlign = "center";
    element.style.borderRadius = "10px"
    ui.setBubblePosition(element, physics)
    ui.output.appendChild(element)

    ui.bubbleList.push({
      physics:physics
    , death: false
    , text: text
    , time: time
    , element: element
    })
  }
}

module.exports = ui

}());
