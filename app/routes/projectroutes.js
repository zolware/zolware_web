var authenticationService = require('../services/AuthenticationService');
var projectService = require('../services/ProjectService');
var projectAPIService = require('../services/ProjectAPIService');
var dataSourceService = require('../services/DataSourceService');
var dataSourceAPIService = require('../services/DataSourceAPIService');

module.exports = function(app) {

  app.param('symbol', function(req, res, next, symbol) {

    // check if the user with that name exists
    // do some validations
    var modified = symbol; // + 't';

    // save name to the request
    req.params.symbol = modified;

    next();
  });

  // projects
  app.get('/api/projects', authenticationService.checkAuthToken, projectAPIService.getAllProjectsForUser);
  app.get('/api/projects/:project_id', authenticationService.checkAuthToken, projectAPIService.getProjectById);
  app.post('/api/projects/add', authenticationService.checkAuthToken, projectAPIService.addProject);
  app.post('/api/projects/edit/:project_id', authenticationService.checkAuthToken, projectAPIService.editProject);
  app.post('/api/projects/delete/:project_id', authenticationService.checkAuthToken, projectAPIService.deleteProject);
  
  
  app.post('/api/projects/:project_id/adddatasource', authenticationService.checkAuthToken, projectAPIService.addDataSourceToProject);
  
  app.get('/api/project/:project_id/datasources', authenticationService.checkAuthToken, dataSourceService.getAllDataSourcesForProject);
  
  // projects
  app.get('/projects', isLoggedIn, projectService.getAllProjectsForUser);
  app.get('/projects/:project_id', isLoggedIn, projectService.getProjectById);
  app.post('/projects/add', isLoggedIn, projectService.addProject);
  app.post('/projects/edit/:project_id', isLoggedIn, projectService.editProject);
  app.post('/projects/delete/:project_id', isLoggedIn, projectService.deleteProject);
  
  app.post('/projects/:project_id/adddatasource', isLoggedIn, projectService.addDataSourceToProject);
  
  app.get('/project/:project_id/datasources', authenticationService.isLoggedIn, dataSourceService.getAllDataSourcesForProject);
};



// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}