var request = require('request');
var config = require('../../config/app');

var Model = require('../models/model');



exports.getAllModelsForUser = function(req, res) {
  var authenticatedUser = req.user;
  var output = req.query.output;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'models',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + authenticatedUser.token
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (is_ajax_request || output === 'json') {
      res.json(data);
    } else {
      res.render('models.ejs', {
        models: data.models,
        user: authenticatedUser,
        back_url: req.header('Referer')
      })
    }
  });
}


exports.addModel = function(req, res) {
  var modelname = req.body.modelname;
  var modeldescription = req.body.modeldescription;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/add',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var model = data.model
    if (error)
      throw error;
    res.redirect('/models/' + model._id);
  });
};


exports.deleteModel = function(req, res) {
  var modelId = req.params.model_id;
  var authenticatedUser = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/delete/' + modelId,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + authenticatedUser.token
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    res.redirect('/models')
  });
}


exports.getModelById2 = function(req, res) {
  var model_id = req.params.model_id
  var output = req.query.output;
  var user = req.user;
  var is_ajax_request = req.xhr;

  function requestAsync(options) {
    return new Promise(function(resolve, reject) {
      request(options, function(err, res, body) {
        if (err) {
          return reject(err);
        }
        return resolve([res, body]);
      });
    });
  }

  var optionsForModel = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  var optionsForDatasources = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'datasources',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };


var returnPackage = {};
  Promise.all([requestAsync(optionsForModel), requestAsync(optionsForDatasources) /*, requestAsync(optionsForSignals)*/ ])
    .then(function(allData) {
      // All data available here in the order it was called.
      var modelBody = allData[0][0].body;
      var datasourceBody = allData[1][0].body;
    
    returnPackage.model = modelBody;
    returnPackage.datasources = datasourceBody;

      if (modelBody.datasource !== undefined) {
        
        
        var optionsForSignals = {
          method: 'GET',
          uri: config.app.baseurl + config.api.url + 'datasources/' + modelBody.datasource._id + '/signals?depth=name',
          headers: {
            'Content-Type': config.api.contentType,
            'Authorization': 'Bearer ' + user.token
          }
        };
         
        Promise.all([requestAsync(optionsForSignals)])
          .then(function(allData) {
              var signalsBody = allData[0][0].body;
          
          returnPackage.signals = signalsBody;
          
           if (is_ajax_request || output === 'json') {
              res.json(returnPackage);
            } else {
              if (modelBody.status === 0 || datasourceBody.status === 0) {
                res.render('404.ejs', {
                  error: modelBody.message,
                  user: user,
                });
              } else {
                res.render('model.ejs', {
                  model: modelBody,
                  datasources: datasourceBody.datasources,
                  signals: signalsBody.signals,
                  user: user,
                  back_url: req.header('Referer')
                })
              }
            }
          });
      }
    });
}


exports.getModelById = function(req, res) {
  var model_id = req.params.model_id
  var output = req.query.output;

  var user = req.user;

  var is_ajax_request = req.xhr;

  var optionsForModel = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  var optionsForDatasources = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'datasources',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(optionsForModel, function(error_model, response_model, body_model) {
    request(optionsForDatasources, function(error_datasource, response_datasource, body_datasource) {

      if (!error_model && !error_datasource && response_model.statusCode == 200 && response_datasource.statusCode == 200) {
        var data_model = JSON.parse(body_model);
        var data_datasource = JSON.parse(body_datasource);
        
        var modelDatasource = "1";
        if(data_datasource.status == 1 && data_model.model.datasource !== undefined)
          modelDatasource = data_model.model.datasource._id;
        
        var optionsForSignals = {
          method: 'GET',
          uri: config.app.baseurl + config.api.url + 'datasources/' + modelDatasource + '/signals?depth=name,description',
          headers: {
            'Content-Type': config.api.contentType,
            'Authorization': 'Bearer ' + user.token
          }
        };

        request(optionsForSignals, function(error_signals, response_signals, body_signals) {
          
          if (!error_signals && response_signals.statusCode == 200) {
            var data_signals = JSON.parse(body_signals);

            if (is_ajax_request || output === 'json') {
              res.json({
                model: data_model.model,
                datasources: data_datasource,
                signals: data_signals.signals
              });
            } else {
              if (data_model.status === 0 ) {
                res.render('404.ejs', {
                  error: data_model.message,
                  user: user,
                });
              } else {
                res.render('model.ejs', {
                  model: data_model.model,
                  datasources: data_datasource.datasources,
                  signals: data_signals.signals,
                  user: user,
                  back_url: req.header('Referer')
                })
              }
            }
          }
        });
      } else {
        res.status(404).send('Message not found');
      }
    });
  });

}





exports.editModel = function(req, res) {
  var model_id = req.params.model_id
  var model_name = req.body.model_name;
  var model_description = req.body.model_description;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/edit/' + model_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: {
      model_name: model_name,
      model_description: model_description
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    res.redirect(config.routes.models + model_id);
  });
};


//---- Components


exports.getComponentsForModel = function(req, res) {
  var model_id = req.params.model_id;
  var user = req.user;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id + '/components',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    res.json(data);
  });

}


exports.addComponentToModel = function(req, res) {
  var model_id = req.params.model_id;
  var component_type = req.query.component_type;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id + '/addcomponent?component_type=' + component_type,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var model = data.model
    if (error)
      throw error;
    res.redirect(config.routes.models + model._id);
  });
};


exports.addPresetComponentsToModel = function(req, res) {
  var model_id = req.params.model_id;
  var preset_type = req.query.preset_type;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id + '/addpresetcomponents?preset_type=' + preset_type,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var model = data.model
    if (error)
      throw error;
    res.redirect(config.routes.models + model._id);
  });
};



exports.updateModelComponent = function(req, res) {
  var model_id = req.params.model_id;
  var component_type = req.query.component_type;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id + '/addcomponent?component_type=' + component_type,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var model = data.model
      // console.log(model);
    if (error)
      throw error;
    res.redirect(config.routes.models + model._id);
  });
};




exports.deleteComponentFromModel = function(req, res) {
  var model_id = req.params.model_id;
  var component_id = req.params.component_id;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id + '/deletecomponent/' + component_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var model = data.model
    if (error)
      throw error;
    res.redirect(config.routes.models + model_id);
  });
};


exports.deleteAllComponentsFromModel = function(req, res) {
  var model_id = req.params.model_id;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id + '/components/deleteall/',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    var model = data.model
    if (error)
      throw error;
    res.redirect(config.routes.models + model_id);
  });
};


exports.changeDataSourceForModel = function(req, res) {
  var model_id = req.params.model_id;
  var datasource_id = req.params.datasource_id;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'model/' + model_id + '/setdatasource/' + datasource_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    res.json(data);
  });
}




exports.updateDataForComponent = function(req, res) {
  var component_id = req.params.component_id;
  var user = req.user;
  var formBody = req.body;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'modelcomponents/' + component_id + '/setdata',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: formBody
  };
  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    res.json(data);
  });
}



exports.getModelStates = function(req, res) {
  var model_id = req.params.model_id;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id + '/getstates',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;

    res.json(body);
  });
}


exports.addStateToModel = function(req, res) {
  var model_id = req.params.model_id;
  var state_name = req.body.state_name;
  var user = req.user;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/' + model_id + '/addstate',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;

    if (is_ajax_request) {
      //res.json(body);
    } else {
      res.redirect(config.routes.models + model_id);
    }
  });
}



exports.deleteStateFromModel = function(req, res) {
  var model_id = req.params.model_id;
  var state_id = req.params.state_id;
  var user = req.user;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'model/' + model_id + '/deletestate/' + state_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    if (is_ajax_request) {
      res.json(body);
    } else {
      res.redirect(config.routes.models + model_id);
    }
  });
}


exports.runModel = function(req, res) {
  var model_id = req.params.model_id;
  var user = req.user;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'models/run/' + model_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
   // if (is_ajax_request) {
      res.json(body);
   // } else {
  //    res.redirect('/models/' + model_id);
   // }
  });
}