var modelApp = modelApp || {};

// Self-executing wrapper
(function($) {
  "use strict";


  zolwareModelApp.modelApp = {
    
    Global: {
    isSaved: true,
    num_states: 0,
    num_signals: 0
  },

    init: function() {
      zolwareModelApp.modelApp.attachHandlers();
    },


    attachHandlers: function() {
      $("#add_fullmodel").click(modelApp.handlers.addFullModelComponents);
      $("#add_vector").click(modelApp.handlers.addVector);
      $("#add_matrix").click(modelApp.handlers.addMatrix);
      $("#remove_all_components").click(modelApp.handlers.deleteAllComponentsFromModel);
      //$('#confirm-delete-model').on('click', '#btn-ok-delete-model', modelApp.handlers.deleteModel);
      $('body').on('click', '#btn-ok-delete-model', modelApp.handlers.deleteModel);

    }

  }



})($);