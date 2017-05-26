var Project = require('../models/project');
var DataSource = require('../models/data_source').DataSource;
var Signal = require('../models/data_source').Signal;
var Component = require('../models/component');

var mongoose = require('mongoose');

exports.getAllProjectsForUser = function(req, res) {
  // Get the authenticated user
  var user = req.user;

  var criteria = {};
  criteria = {
    'user': user,
  };

  Project.find(criteria, function(err, projects) {

    if (err || !projects.length) {
      res.json({
        status: 0
      });
    } else {
      var returnedProjects = projects;
      res.json({
        status: 1,
        projects: returnedProjects
      });
    }
  });
}



exports.addProject = function(req, res) {
  var name = req.body.projectname;
  var description = req.body.projectdescription;
  var user = req.user;

  // create project
  var newProject = Project({
    name: name,
    description: description,
    user: user
  });


  newProject.save(function(err, project) {
    
    if (err)
      res.json({
        status: 0,
        message: 'Project not saved'
      });
    else
      res.json({
        status: 1,
        message: 'Project saved successfully',
        project: project
      });
  });
};




exports.getProjectById = function(req, res) {
  var project_id = req.params.project_id;
  var user = req.user;

  var project_id_array = [project_id];

  Project.findOne({
    '_id': project_id,
    'user': user
  }).exec(function(err, project) {

    var criteria = {
      //"projects._id": mongoose.Types.ObjectId(project_id)
      projects: {
        $in: project_id_array
      }
    };

    DataSource.find(
      criteria,
      function(err, datasources) {

        if (datasources) {
          datasources.forEach(function(datasource) {
            //   project.datasoures.pull(datasource);
            console.log("Pulling " + datasource._id)
          })
        }

        if (!project || err)
          res.json({
            status: 0,
            message: 'Project not found'
          });
        else
          res.json({
            status: 1,
            project: project,
            datasources: datasources
          });

      })


  });
}




exports.deleteProject = function(req, res) {
  var project_id = req.params.project_id;

  if (project_id === "")
    res.json({
      status: -1,
      message: "Could not find project with ID " + project_id
    });

  Project.find({
    _id: project_id
  }).remove(function(err, project_id) {
    if (err) {
      res.json({
        status: -1,
        message: "Could not remove project with ID " + project_id
      });
    } else
      res.json({
        status: -1,
        message: "Project removed with ID " + project_id
      });
  })
}


exports.editProject = function(req, res) {
  var project_id = req.params.project_id;
  var name = req.body.projectname;
  var description = req.body.projectdescription;
  var user = req.user;

  if (project_id === "")
    res.json({
      staus: -1,
      message: "Could not find project with ID " + project_id
    });

  Project.findOne({
    _id: project_id,
    'user': user
  }, function(err, project) {
    if (err) {
      res.send(err);
    }

    project.name = name;
    project.description = description;

    project.save(function(err, project) {
      if (err) {
        res.send(err);
      }
      res.json(project);
    });

  })


}


var constructTestSignals = function(formData) {
  var num_signals = parseInt(formData.number_cols);
  var signals = [];
  for (i = 0; i < num_signals; i++) {
    var newTestSignal = Signal({
      name:formData.signal_name[i],
      dt:formData.signal_dt[i],
      linear_gradient:formData.linear_gradient[i],
      periodic_mag:formData.periodic_mag[i],
      periodic_period:formData.periodic_period[i],
    });
    signals.push(newTestSignal);
  }
  return signals; 
}


exports.addDataSourceToProject = function(req, res) {
  var project_id = req.params.project_id;
  var data_source = req.body.data_source;
  var user = req.user;

  //var signals = constructTestSignals(data_source);

  if (project_id === "")
    res.json({
      staus: 'Error',
      message: "Could not find project with ID " + project_id
    });

  Project.findOne({
    _id: project_id
  }, function(err, project) {
    if (err) {
      res.send(err);
    }

    var newDataSource = DataSource({
      name: data_source.name,
      description: data_source.description,
      user: user
    });

    newDataSource.projects.push(project);
    
    //signals.forEach(function(signal){
    //  newDataSource.signals.push(signal);
    //});

    // handle errors ..
    project.datasources.push(newDataSource);
    newDataSource.save(function(err1) {
      project.save(function(err2, project) {
        if (err1 || err2) {
          res.send(err);
        }
        res.json(project);
      });
    });
  })
}