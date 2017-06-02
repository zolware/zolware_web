modelApp.modelcode = {

  saveModelDataSource: function(model_id, datasource_id) {
    $.ajax({
      type: 'POST',
      url: '/model/' + model_id + '/setdatasource/' + datasource_id,
      dataType: "json",
      async: true,
      success: modelApp.modelcode.getStates
    });
  },


  getSignalNamesFromDataSource: function(datasource_id2) {
    
    var datasource_id = $('#datasource_select').data("model_datasource");
    if(datasource_id !== undefined) {
      $.ajax({
        type: 'GET',
        url: '/datasources/' + datasource_id.trim() + '/signals?depth=name,description',
        dataType: "json",
        async: true,
        success: function(data) {
          modelApp.view.populateSignalTable(data)
        }
      });
    }
  },


 

  reloadAll: function(datasource_id_in) {
    $('#states_title').html(" States (loading...)");
    $('#signals_title').html(" Signals (loading...)");
    var datasource_id = "";
    if(datasource_id_in === null)
      datasource_id = $('#datasource_select').data("model_datasource").trim();
    else
      datasource_id = datasource_id_in
    
    var model_id = $('body').data("model_id").trim();
    
    var getModel = $.ajax({
      type: 'GET',
      url: '/models/' + model_id,
      dataType: "json",
      async: true
    });
    
    
    var loadComponents = $.ajax({
      type: 'GET',
      url: '/models/' + model_id + '/components',
      dataType: "json",
      async: true
    });

    var getStates = $.ajax({
      type: 'GET',
      url: '/models/' + model_id + '/getstates',
      dataType: "json",
      async: true
    });
    
    var getSignalsFromDatasource = $.ajax({
      type: 'GET',
      url: '/datasources/' + datasource_id + '/signals?depth=name,description',
      dataType: "json",
      async: true
    });

    $.when(getModel, getStates, getSignalsFromDatasource, loadComponents).done(function(getModel_results, getStates_results, getSignals_results, loadComponents_results) {
      // Each returned resolve has the following structure:
      // [data, textStatus, jqXHR]
      // e.g. To access returned data, access the array at index 0
      console.log(getModel_results[0]);
      console.log(getStates_results[0]);
      console.log(getSignals_results[0]);
      console.log(loadComponents_results[0]);
      modelApp.view.populateSignalTable(getSignals_results[0])
      modelApp.view.populateComponents(getModel_results[0].model, getSignals_results[0].signals);
      modelApp.view.renderStates(getStates_results[0])
      modelApp.view.populateComponentTable(loadComponents_results[0]);
      $('#states_title').html(" States (" + getStates_results[0].states.length + ")");
      $('#signals_title').html(" Signals (" + getSignals_results[0].signals.length + ")");
    });


  },



  getStates: function() {
    var model_id = $('body').data("model_id");
    $.ajax({
      type: 'GET',
      url: '/models/' + model_id + '/getstates',
      dataType: "json",
      async: true,
      success: modelApp.view.renderStates
    });
  },


  getDataSource: function() {
    var selected = $('select').find('option:selected');
    var datasource_id = selected.data('datasource_id');
    var component_id = selected.data('component_id');
    var num_signals = selected.data('number_signals');
    zolwareModelApp.modelApp.Global.num_signals = num_signals;
    modelApp.modelcode.getStates();
  },


  getDataSourcesForUser: function() {
    var model_id = $('body').data("model_id");
    $.ajax({
      type: 'GET',
      url: '/datasources',
      dataType: "json",
      async: true,
      success: modelApp.view.populateDatasourcesSelect
    });
  },



  loadComponents: function() {
    var model_id = $('body').data("model_id");
    $.ajax({
      type: 'GET',
      url: '/models/' + model_id + '/components',
      dataType: "json",
      async: true,
      //success: populateComponents2
    });
  },


  saveComponentData: function(e) {
    var component_id = $(this).data("component_id");
    e.preventDefault();
    $.ajax({
      url: '/modelcomponents/' + component_id + '/setdata',
      type: 'post',
      dataType: 'json',
      data: $("#form-" + component_id).serialize(),
      success: function(data) {
        modelApp.modelcode.reloadPage
      }
    });
  },


  getJSVector: function(data) {
    if (Array.isArray(data))
      return data;
    else {
      var dataVector = JSON.parse(data);
      return dataVector;
    }
  },


  getJSMatrix: function(data) {
    if (Array.isArray(data))
      return data;
    else {
      var dataMatrix = JSON.parse(data);
      return dataMatrix;
    }
  },



  afterRunModel: function(data) {
    console.log(data);
  },

  success: function() {
    window.location.reload(true);
  },


  reloadPage: function() {
    modelApp.modelcode.getDataSource();
    zolwareModelApp.modelApp.Global.isSaved = true;
  },

};