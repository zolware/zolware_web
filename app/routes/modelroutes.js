var authenticationService = require('../services/AuthenticationService');
var modelService = require('../services/ModelService');
var modelAPIService = require('../services/ModelAPIService');

module.exports = function(app) {
  
  // models
  app.get('/models',                     authenticationService.isLoggedIn, modelService.getAllModelsForUser);
  app.get('/models/:model_id',           authenticationService.isLoggedIn, modelService.getModelById);
  app.post('/models/add',                 authenticationService.isLoggedIn, modelService.addModel);
  app.post('/models/edit/:model_id',      authenticationService.isLoggedIn, modelService.editModel);
  app.post('/models/delete/:model_id',    authenticationService.isLoggedIn, modelService.deleteModel);
  
  app.post('/models/:model_id/addcomponent', authenticationService.isLoggedIn, modelService.addComponentToModel);
  app.post('/models/:model_id/addpresetcomponents', authenticationService.isLoggedIn, modelService.addPresetComponentsToModel);
  
  app.post('/models/:model_id/components/deleteall', authenticationService.isLoggedIn, modelService.deleteAllComponentsFromModel);
  app.post('/models/:model_id/deletecomponent/:component_id', authenticationService.isLoggedIn, modelService.deleteComponentFromModel);
  
  
  app.get('/models/:model_id/getstates', authenticationService.isLoggedIn, modelService.getModelStates);
  app.post('/models/:model_id/addstate', authenticationService.isLoggedIn, modelService.addStateToModel);
  app.post('/models/:model_id/deletestate/:state_id', authenticationService.isLoggedIn, modelService.deleteStateFromModel);

  
  app.get('/models/:model_id/components', authenticationService.isLoggedIn, modelService.getComponentsForModel);
  
  //app.get('/project/:project_id/datasources', authenticationService.isLoggedIn, modelService.getAllDataSourcesForProject);
  //app.post('/modelcomponent/:component_id/setdatasource', authenticationService.isLoggedIn, modelService.changeDataSourceForComponent);
  app.post('/model/:model_id/setdatasource/:datasource_id', authenticationService.isLoggedIn, modelService.changeDataSourceForModel);
  
  app.post('/modelcomponents/:component_id/setdata', authenticationService.isLoggedIn, modelService.updateDataForComponent);
  
  app.post('/models/run/:model_id', authenticationService.isLoggedIn, modelService.runModel);
 
};