var request = require('request');
var config = require('../../config/app'); // use this one for testing

var Project = require('../models/project');



exports.getAllProjectsForUser = function(req, res) {
  // Get the authenticated user
  var user = req.user;
  var output = req.query.output;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'projects',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);


    if (is_ajax_request || output === 'json') {
      res.json(data);
    } else {
      res.render('projects.ejs', {
        projects: data.projects,
        user: user,
        back_url: req.header('Referer')
      })
    }
  });
}



exports.addProject = function(req, res) {
  var projectname = req.body.projectname;
  var projectdescription = req.body.projectdescription;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'projects/add',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: 
     // projectname: projectname,
      //projectdescription: projectdescription
      req.body
    
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var project = data.project
   // console.log(project);
    if (error)
      throw error;
    res.redirect('/projects/'+project._id);
  });


};






exports.deleteProject = function(req, res) {
  var project_id = req.params.project_id;
  var user = req.user;
  
  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'projects/delete/' + project_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };
  
  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    res.json({redirect: "/projects"});
  });
}




exports.getProjectById = function(req, res) {
  var project_id = req.params.project_id
  var output = req.query.output;

  var user = req.user;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'projects/' + project_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      
      if(is_ajax_request || output ==='json') {
        res.json(data);
      }
      else {
        if(data.status === 0) {
           res.render('404.ejs', {
             error: data.message, 
             user: user,});
        } 
        else {
        res.render('project.ejs', {
        project: data.project,
        datasources: data.datasources,
        user: user,
        back_url: req.header('Referer')
      })
      }
      }
      
      
      
    } else {
      res.status(404).send('Message not found');
    }
  });
}





exports.editProject = function(req, res) {
  var project_id = req.params.project_id
  var projectname = req.body.projectname;
  var projectdescription = req.body.projectdescription;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'projects/edit/' + project_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: {
      projectname:projectname,
      projectdescription: projectdescription
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    res.redirect('/projects/' + project_id);
  });


};


exports.addDataSourceToProject = function(req, res) {
  var project_id = req.params.project_id;
  var data_source = req.body;
  var user = req.user;
  
  
  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'projects/' + project_id + '/adddatasource',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: {
      data_source
    }
  };
  
  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    res.redirect('/projects/' + project_id);
  });
  
}

