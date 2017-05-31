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
      modelApp.modelcode.getModel();
      modelApp.modelcode.getStates();
      zolwareModelApp.modelApp.attachHandlers();
      modelApp.modelcode.getDataSourcesForUser();
      modelApp.modelcode.getSignalNamesFromDataSource(34);
    },


    attachHandlers: function() {
      $("#add_fullmodel").click(modelApp.handlers.addFullModelComponents);
      
      $("#add_vector").click(modelApp.handlers.addVector);
      
      $("#add_matrix").click(modelApp.handlers.addMatrix);
      
      $("#remove_all_components").click(modelApp.handlers.deleteAllComponentsFromModel);
      //$('#confirm-delete-model').on('click', '#btn-ok-delete-model', modelApp.handlers.deleteModel);
      $('body').on('click', '#btn-ok-delete-model', modelApp.handlers.deleteModel);
      
      $("#datasource_select").change(modelApp.handlers.changeDatasourceForModel);
      
      $('body').on('click', '#remove_state', modelApp.handlers.removeState);
      
      $('body').on('click', '#add_state', modelApp.handlers.addState);
      
      $('body').on('click', '#add_state_toggle_button', modelApp.handlers.toggleAddState);
      
      $('body').on('click', '#delete_component', modelApp.handlers.deleteComponent);
      
      $('body').on('click', '#delete_datasource', modelApp.handlers.deleteDatasource);
      
      $("#showAddDatasourceForm").click(modelApp.handlers.showAddDatasourceForm);
      
      $("#component_type").change(modelApp.handlers.changeComponentType);
      
      $("#run_model").click(modelApp.handlers.runModel);
    }

  }



})($);