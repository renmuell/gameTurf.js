/******************************************************************************
 * ui.js
 *
 * 
 *****************************************************************************/

(function() {

/*global require, module */

var dat       = require('../../vendors/dat.gui.min')
var settings  = require('./settings')

/**
 *  
 */ 
var ui = {

  /**
   *  
   */ 
  menu  : document.getElementById("Menu")

  /**
   *  
   */ 
, continueBtn  : document.getElementById("continue")

  /**
   *  
   */ 
, datGui: settings.datGuiIsOn ? new dat.GUI() : undefined    

, init: function(continueGameCallback){
    ui.continueBtn.addEventListener('click', function(){
      continueGameCallback();
    })
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
}

module.exports = ui

}());
