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


  getSignalNamesFromDataSource: function(datasource_id) {
    $.ajax({
      type: 'GET',
      url: '/datasources/' + datasource_id + '/signals?depth=name,description',
      dataType: "json",
      async: true,
      success: modelApp.view.populateSignalTable
    });
  },


  getModel: function() {
    var model_id = $('body').data("model_id");
    $.ajax({
      type: 'GET',
      url: '/models/' + model_id,
      dataType: "json",
      async: true,
      success:  modelApp.modelcode.dd
    });
  },


  dd: function(data) {
    modelApp.view.populateComponents(data.model, data.signals);
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