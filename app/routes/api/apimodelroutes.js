var authenticationService = require('../../services/AuthenticationService');
var modelService = require('../../services/ModelService');
var modelAPIService = require('../../services/ModelAPIService');

module.exports = function(app) {

  // models
  app.get('/api/models',                                          authenticationService.checkAuthToken, modelAPIService.getAllModelsForUser);
  app.get('/api/models/:model_id',                                authenticationService.checkAuthToken, modelAPIService.getModelById);
  app.post('/api/models/add',                                      authenticationService.checkAuthToken, modelAPIService.addModel);
  app.post('/api/models/edit/:model_id',                           authenticationService.checkAuthToken, modelAPIService.editModel);
  app.post('/api/models/delete/:model_id',                         authenticationService.checkAuthToken, modelAPIService.deleteModel);
  
  app.post('/api/models/:model_id/addcomponent',                   authenticationService.checkAuthToken, modelAPIService.addComponentToModel);
  app.post('/api/models/:model_id/addpresetcomponents',            authenticationService.checkAuthToken, modelAPIService.addPresetComponentsToModel);
  app.post('/api/models/:model_id/components/deleteall',           authenticationService.checkAuthToken, modelAPIService.deleteAllComponentsFromModel);
  app.post('/api/models/:model_id/deletecomponent/:component_id',  authenticationService.checkAuthToken, modelAPIService.deleteComponentFromModel);  
  app.get('/api/models/:model_id/components',                     authenticationService.checkAuthToken, modelAPIService.getComponentsForModel);
  
  app.post('/api/model/:model_id/setdatasource/:datasource_id',    authenticationService.checkAuthToken, modelAPIService.changeDataSourceForModel);
  
  app.post('/api/modelcomponents/:component_id/setdata',           authenticationService.checkAuthToken, modelAPIService.updateDataForComponent);
   
  //States
  app.get('/api/models/:model_id/getstates',                     authenticationService.checkAuthToken, modelAPIService.getModelStates);
  app.post('/api/models/:model_id/addstate',                      authenticationService.checkAuthToken, modelAPIService.addStateToModel);
  app.post('/api/models/:model_id/deletestate/:state_id',         authenticationService.checkAuthToken, modelAPIService.deleteStateFromModel);
  
  app.post('/api/models/run/:model_id',                           authenticationService.checkAuthToken, modelAPIService.runModel);
  
};