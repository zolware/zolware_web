var authenticationService = require('../services/AuthenticationService');
var dataSourceService = require('../services/DataSourceService');
var dataSourceAPIService = require('../services/DataSourceAPIService');

var signalService = require('../services/SignalService');
var signalAPIService = require('../services/SignalAPIService')


module.exports = function(app, parseForm, csrfProtection) {

  // projects
  app.get('/api/datasources', authenticationService.checkAuthToken, dataSourceAPIService.getAllDataSourcesForUser);
  app.get('/api/datasources/:datasource_id', authenticationService.checkAuthToken, dataSourceAPIService.getDataSourceById);
  app.post('/api/datasources/add', authenticationService.checkAuthToken, dataSourceAPIService.addDataSource);
  app.post('/api/datasources/edit/:datasource_id', authenticationService.checkAuthToken, dataSourceAPIService.editDataSource);
  app.post('/api/datasources/delete/:datasource_id', authenticationService.checkAuthToken, dataSourceAPIService.deleteDataSource);
  
  
  app.get('/api/datasources/:datasource_id/signals', authenticationService.checkAuthToken, dataSourceAPIService.getAllSignalsFromDataSource);
  app.post('/api/datasources/:datasource_id/addsignal', authenticationService.checkAuthToken, dataSourceAPIService.addSignalToDataSource);
  app.post('/api/datasources/:datasource_id/deletesignal/:signal_id', authenticationService.checkAuthToken, dataSourceAPIService.deleteSignalFromDataSource);
  
  
  app.get('/api/datasources/:datasource_id/signals/:signal_id', authenticationService.checkAuthToken, signalAPIService.getSignalById);
  app.post('/api/datasources/:datasource_id/share', authenticationService.checkAuthToken, dataSourceAPIService.addDataSourceShareToken);
  app.get('/api/datasources/:datasource_id/shares', authenticationService.checkAuthToken, dataSourceAPIService.getAllShareTokensForDataSource);
  app.post('/api/datasources/:datasource_id/deleteshare/:share_id', authenticationService.checkAuthToken, dataSourceAPIService.deleteShareTokenFromDataSource);
  
  app.post('/api/signals/:signal_id', authenticationService.checkAuthToken, signalAPIService.editSignal);
  
  
   app.get('/api/signals/:signal_id/getdata', authenticationService.checkAuthToken, signalAPIService.getDataFromSignal);
   app.post('/api/signals/:signal_id/adddata', authenticationService.checkAuthToken, signalAPIService.addDataToSignal);
  
  app.get('/api/datasources/:datasource_id/signals/:signal_id/getdata', authenticationService.checkAuthToken, signalAPIService.getDataFromDataSource);
  app.get('/api/datasources/:datasource_id/getdata', authenticationService.checkAuthToken, signalAPIService.getDataFromDataSource);
  
  app.post('/api/datasources/:datasource_id/add_measurements', authenticationService.checkAuthToken, dataSourceAPIService.addMeasurementDataToDatasource);
  
  
  // projects
  app.get('/datasources', csrfProtection, authenticationService.isLoggedIn, dataSourceService.getAllDataSourcesForUser);
  app.get('/datasources/:datasource_id', authenticationService.isLoggedIn, dataSourceService.getDataSourceById);
  app.post('/datasources/add', parseForm, csrfProtection, authenticationService.isLoggedIn, dataSourceService.addDataSource);
  app.post('/datasources/edit/:datasource_id', authenticationService.isLoggedIn, dataSourceService.editDataSource);
  app.post('/datasources/delete/:datasource_id', authenticationService.isLoggedIn, dataSourceService.deleteDataSource);
  
  app.get('/datasources/:datasource_id/signals', authenticationService.isLoggedIn, dataSourceService.getAllSignalsFromDataSource);
  app.post('/datasources/:datasource_id/addsignal', authenticationService.isLoggedIn, dataSourceService.addSignalToDataSource);
  app.post('/datasources/:datasource_id/deletesignal/:signal_id', authenticationService.isLoggedIn, dataSourceService.deleteSignalFromDataSource);
  
  app.get('/datasources/:datasource_id/signals/:signal_id', authenticationService.isLoggedIn, signalService.getSignalById);
  app.post('/datasources/:datasource_id/share', authenticationService.isLoggedIn, dataSourceService.addDataSourceShareToken);
  app.get('/datasources/:datasource_id/shares', authenticationService.isLoggedIn, dataSourceService.getAllShareTokensForDataSource);
  app.post('/datasources/:datasource_id/deleteshare/:share_id', authenticationService.isLoggedIn, dataSourceService.deleteShareTokenFromDataSource);
  
  
   app.get('/datasources/:datasource_id/getdata', authenticationService.isLoggedIn, signalService.getDataFromDataSource);
};
