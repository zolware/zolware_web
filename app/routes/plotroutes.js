var authenticationService = require('../services/AuthenticationService');
var plotService = require('../services/PlotService');
var dataSourceService = require('../services/DataSourceService');
var dataSourceAPIService = require('../services/DataSourceAPIService');

module.exports = function(app) {

  
  

  app.get('/plot/:datasource_id', authenticationService.isLoggedIn, plotService.plotDataSource);

};

