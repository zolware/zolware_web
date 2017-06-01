"use strict";

var State = require('../models/state');
var Model = require('../models/model');
var DataSource = require('../models/data_source').DataSource;
var Signal = require('../models/data_source').Signal;
var Component = require('../models/component').Component;
var Vector = require('../models/component').Vector;
var Matrix = require('../models/component').Matrix;
var KalmanFilter = require('../models/component').KalmanFilter;

var mongoose = require('mongoose');
var validator = require('validator');

var csrf = require('csurf')

exports.getAllModelsForUser = function(req, res) {
  var authenticatedUser = req.user;

  let findCriteria = {
    'user': authenticatedUser,
  };

  Model.find(findCriteria, function(err, models) {
    if (err || !models) {
      res.json({
        status: 0,
        message: "No models found."
      });
    } else {
      var returnedModels = models;
      res.json({
        status: 1,
        models: returnedModels
      });
    }
  });
}



var addMatrixComponent = function(name, user, model, rows, cols) {
  var newMatrix = Matrix({
    name: name,
    user: user,
    model: model,
    rows: rows,
    cols: cols
  });
  model.components.push(newMatrix);
  newMatrix.save();
}

var addVectorComponent = function(name, user, model, rows) {
  var newVector = Vector({
    name: name,
    user: user,
    model: model,
    rows: rows,
  });
  model.components.push(newVector);
  newVector.save();
}


var addDefaultComponents = function(user, model, numSignals, numStates, numControls) {
  addVectorComponent("InitalStateVector", user, model, "states");
  addMatrixComponent("InitalStateCovarianceMatrix", user, model, "states", "states");
  addVectorComponent("MeasurementVector", user, model, "signals");
  addMatrixComponent("MeasurementNoiseCovarianceMatrix", user, model, "signals", "signals");
  if (numControls > 0) {
    addVectorComponent("ControlInputVector", user, model, numControls);
    addMatrixComponent("ControlFunctionMatrix", user, model, "signals", numControls);
  }
  addMatrixComponent("TransitionFunctionMatrix", user, model, "states", "states");
  addMatrixComponent("ProcessNoiseCovarianceMatrix", user, model, "states", "states");
  addMatrixComponent("MeasurementNoiseCovarianceMatrix", user, model, "signals", "signals");
}



exports.addModel = function(req, res) {
  var modelName = req.body.modelname;
  var modelDescription = req.body.modeldescription;
  var authenticatedUser = req.user;

  var newModel = Model({
    name: modelName,
    description: modelDescription,
    user: authenticatedUser,
    running: false
  });

  DataSource.findOne({
    'user': authenticatedUser
  }).populate('signals', '-measurements').exec(function(err_datasource, datasource) {

    if (datasource) {
      newModel.datasource = datasource;
      var states = [];
      datasource.signals.forEach(function(signal) {
        states.push({
          "name": signal.name,
          "type": "from signal"
        });
        var state = new State({
          user: authenticatedUser,
          model: newModel,
          name: signal.name,
          type: 'signal'
        });

        newModel.states.push(state);
        state.save();


      });
      // newModel.states = states;
    }

    newModel.save(function(err, model) {
      if (err)
        res.json({
          status: 0,
          message: 'Model not saved'
        });
      else
        res.json({
          status: 1,
          message: 'Model saved successfully',
          model: model
        });
    });
  });
};



exports.getModelById = function(req, res) {
  var model_id = req.params.model_id;
  var authenticatedUser = req.user;

  var modelFindCriteria = {
    '_id': model_id,
    'user': authenticatedUser
  };

  Model.findOne(modelFindCriteria)
    .lean().populate('components').populate('datasource', '_id signals name').exec(function(modelErr, model) {
      if (!model || modelErr)
        res.json({
          status: 0,
          message: 'Model not found.'
        });
      else {

        if (model.datasource === null)
          model.states = [];

        res.json({
          status: 1,
          model: model,
        });
      }
    });
}



exports.deleteModel = function(req, res) {
  var model_id = req.params.model_id;

  if (model_id === "") {
    res.json({
      status: -1,
      message: "Could not find model with ID " + model_id
    });
  } else {
    Model.findOne({
      _id: model_id
    }, function(err, model) {
      model.remove(function(err, model) {
        if (err) {
          res.json({
            status: -2,
            message: "Could not remove model with ID " + model_id
          });
        } else
          res.json({
            status: 1,
            message: "Model removed with ID " + model_id
          });
      });
    })
  }
}



exports.editModel = function(req, res) {
  var model_id = req.params.model_id;
  var name = req.body.model_name;
  var description = req.body.model_description;
  var authenticatedUser = req.user;

  if (validator.isEmpty(name)) {
    res.json({
      staus: -2,
      message: "Model name cannot be zero"
    });
  } else if (model_id === "") {
    res.json({
      staus: -1,
      message: "Could not find model with ID " + model_id
    });
  } else {
    name = validator.escape(name);
    description = validator.escape(description);

    var modelFindCriteria = {
      '_id': model_id,
      'user': authenticatedUser
    };

    Model.findOne(modelFindCriteria, function(errModel, model) {
      if (errModel) {
        res.json({
          status: 1,
          message: "Model not found with ID " + model_id
        });
      } else {
        model.name = name;
        model.description = description;

        model.save(function(errModelSave, model) {
          if (errModelSave) {
            res.send(errModelSave);
          }
          res.json(model);
        });
      }
    })
  }
}


//--- Components


exports.getComponentsForModel = function(req, res) {
  var modelId = req.params.model_id;
  var authenticatedUser = req.user;

  var modelFindCriteria = {
    '_id': modelId,
    'user': authenticatedUser
  };

  Model.findOne(modelFindCriteria).populate('components').exec(function(errModel, model) {
    if (!model || errModel)
      res.json({
        status: 0,
        message: 'Model components not found'
      });
    else
      res.json({
        status: 1,
        components: model.components
      });
  });
}





exports.addComponentToModel = function(req, res) {
  var model_id = req.params.model_id;
  var component_name = req.body.component_name;
  var component_type = req.body.component_type;

  var component_rows = req.body.component_rows;
  var component_cols = req.body.component_cols;

  var user = req.user;

  Model.findOne({
    '_id': model_id,
    'user': user
  }).exec(function(err, model) {
    // create model
    var newModelComponent = null;
    if (component_type === "matrix") {
      newModelComponent = Matrix({
        name: component_name,
        user: user,
        model: model,
        rows: component_rows,
        cols: component_cols
      });
    } else if (component_type === "vector") {
      newModelComponent = Vector({
        name: component_name,
        user: user,
        model: model,
        rows: component_rows,
      });
    }

    newModelComponent.save(function(err, component) {
      model.components.push(component);
      model.save(function(err, model) {
        if (!model || err)
          res.json({
            status: 0,
            message: 'Model not found'
          });
        else
          res.json({
            status: 1,
            model: model,
            component: component
          });
      })
    })
  });
}




exports.addPresetComponentsToModel = function(req, res) {
  var model_id = req.params.model_id;
  var preset_type = req.query.preset_type;

  var user = req.user;

  Model.findOne({
    '_id': model_id,
    'user': user
  }).exec(function(err, model) {
    var numControls = 0;
    var numStates = (model.states.length > 0) ? model.states.length : 2;

    var datasource_id = model.datasource;
    // Still looks this up even if datasource_id is crappy, TODO fix later
    DataSource.findOne({
      '_id': datasource_id,
      'user': user
    }).populate('signals', '-measurements').exec(function(err_datasource, datasource) {

      var numSignals = 0;
      if (datasource !== null)
        numSignals = datasource.signals.length;
      model.components = [];

      Component.findOne({
        'model': model,
        'user': user
      }).remove().exec(function(err_datasource, datasource) {

        if (preset_type === "full") {
          addDefaultComponents(user, model, numSignals, numStates, numControls);
        }
        model.save(function(err, model) {
          if (!model || err)
            res.json({
              status: 0,
              message: 'Model not found'
            });
          else
            res.json({
              status: 1,
              model: model
            });
        })
      }); //end Component
    }); //end datasource
  }); //model
}


exports.deleteComponentFromModel = function(req, res) {
  var model_id = req.params.model_id;
  var component_id = req.params.component_id;
  var user = req.user;

  Model.findOne({
    '_id': model_id,
    'user': user
  }).exec(function(err_model, model) {
    if (!model || err_model) {
      res.json({
        status: 0,
        message: 'model component not found'
      });
    } else {
      Component.findOne({
        '_id': component_id,
        'user': user
      }).remove(function(component_err, component) {
        if (!component || component_err) {
          res.json({
            status: 0,
            message: ' component not found'
          });
        } else {
          model.components.pull(mongoose.Types.ObjectId(component_id));
          model.save(function(err, model) {
            res.json({
              status: 1,
              model: model
            });
          });
        }
      });
    }
  });
};


exports.deleteAllComponentsFromModel = function(req, res) {
  var model_id = req.params.model_id;
  var user = req.user;

  Model.findOne({
    '_id': model_id,
    'user': user
  }).exec(function(err_model, model) {
    if (!model || err_model) {
      res.json({
        status: 0,
        message: 'Model (' + model_id + ') not saved.'
      });
    } else {
      Component.find({
        'model': model,
        'user': user
      }).remove(function(component_err, component) {
        if (!component || component_err) {
          res.json({
            status: 0,
            message: ' components not found'
          });
        } else {
          /* Remove existing components */
          model.components = [];
          model.save(function(err, model) {
            res.json({
              status: 1,
              message: component.length + " component(s) removed from model.",
              model: model
            });
          });
        }
      });
    }
  });
};


exports.changeDataSourceForModel = function(req, res) {
  var model_id = req.params.model_id;
  var datasource_id = req.params.datasource_id;
  var user = req.user;

  Model.findOne({
    '_id': model_id,
    'user': user
  }).exec(function(err_model, model) {
    if (!model || err_model) {
      res.json({
        status: 0,
        message: 'model not found'
      });
    } else {
      DataSource.findOne({
        '_id': datasource_id,
        'user': user
      }).populate('signals', '-measurements').exec(function(err_datasource, datasource) {
        if (!datasource || err_datasource) {
          res.json({
            status: 0,
            message: 'DataSource not found'
          });
        } else {

          // Remove existing states for model
          State.find({
            "model": model_id,
            "user": user
          }).remove(function(err_states, states_to_remove) {


            model.datasource = mongoose.Types.ObjectId(datasource_id);
            model.states = [];
            datasource.signals.forEach(function(signal) {
              var newState = new State({
                user: user,
                model: model,
                name: signal.name,
                type: signal.data_type
              });
              newState.save();
              model.states.push(mongoose.Types.ObjectId(newState._id));
            });

            model.save(function(err, model) {
              if (!model || err)
                res.json({
                  status: 0,
                  message: 'model not saved'
                });
              else
                res.json({
                  status: 1,
                  model: model,
                  datasource: datasource
                });
            })



          });


        }
      })
    }
  });
}



exports.updateDataForComponent = function(req, res) {
  var component_id = req.params.component_id;
  var user = req.user;

  var formBody = req.body;

  if (formBody._type === "Matrix") {
    Component.findOne({
      '_id': component_id,
      '_type': "Matrix",
      'user': user
    }).exec(function(err_component, matrix) {
      if (!matrix || err_component) {
        res.json({
          status: 0,
          message: 'Matrix component (' + component_id + ') not found.'
        });
      } else {
        matrix.values = JSON.stringify(formBody.values);
        matrix.save(function(err, matrix) {
          if (!matrix || err)
            res.json({
              status: 0,
              message: 'Matrix component (' + component_id + ') not saved.'
            });
          else
            res.json({
              status: 1,
              component: matrix
            });
        })
      }
    });
  } else if (formBody._type === "Vector") {
    Component.findOne({
      '_id': component_id,
      '_type': "Vector",
      'user': user
    }).exec(function(err_component, vector) {
      if (!vector || err_component) {
        res.json({
          status: 0,
          message: 'Vector component (' + component_id + ') not found.'
        });
      } else {
        vector.values = JSON.stringify(formBody.values);
        vector.save(function(err, vector) {
          if (!vector || err)
            res.json({
              status: 0,
              message: 'Vector component (' + component_id + ') not found.'
            });
          else
            res.json({
              status: 1,
              component: vector
            });
        })
      }
    });
  }
}



exports.getModelStates = function(req, res) {
  var model_id = req.params.model_id;
  var user = req.user;
  State.find({
    "model": model_id,
    "user": user,
    "type": "Sensor data"
  }).exec(function(err_states, states) {
    if (!states || err_states) {
      res.json({
        status: 0,
        // message: 'Model (' + model_id + ') not found.'
      });
    } else {
      res.json({
        status: 1,
        states: states
      });
    }
  });
}


exports.addStateToModel = function(req, res) {
  var model_id = req.params.model_id;
  var state_name = req.body.state_name;
  var state_type = req.body.state_type;
  var user = req.user;

  Model.findOne({
    '_id': model_id,
    'user': user
  }).populate('states').exec(function(err_model, model) {

    if (!model || err_model) {
      res.json({
        status: 0,
        message: 'Model (' + model_id + ') not found.'
      });
    } else {

      var newState = State({
        user: user,
        model: model,
        name: state_name,
        type: state_type
      });

      model.states.push(mongoose.Types.ObjectId(newState._id));
      newState.save(function(err, state) {
        model.save(function(err, models) {
          res.json({
            status: 1,
            states: model.states
          });
        });
      })
    }
  });
}



exports.deleteStateFromModel = function(req, res) {
  var model_id = req.params.model_id;
  var state_id = req.params.state_id;
  var user = req.user;

  Model.findOne({
    '_id': model_id,
    'user': user
  }).select('states').populate('states').exec(function(err_model, model) {
    if (!model || err_model) {
      res.json({
        status: 0,
        message: 'Model (' + model_id + ') not found.'
      });
    } else {
      model.states.pull({
        "_id": mongoose.Types.ObjectId(state_id)
      });

      model.save(function(err, model) {
        State.findOne({
          '_id': state_id
        }).remove(function(err, state) {
          res.json({
            status: 1,
            states: model.states
          });
        });
      })
    }
  });
}




exports.runModel = function(req, res) {
  var model_id = req.params.model_id;
  var user = req.user;

  Model.findOne({
    '_id': model_id,
    'user': user
  }).populate('datasource', '-user -projects').exec(function(err_model, model) {
    if (!model || err_model) {
      res.json({
        status: 0,
        message: 'Model (' + model_id + ') not found.'
      });
    } else {
      Component.find({
        'model': model_id,
        'user': user
      }).select('-user -createdAt -model -updatedAt').exec(function(component_err, components) {
        var modelOut = {
          inputs: {},
          signals: {},
          states: {}
        };
        modelOut.inputs = components;
        modelOut.signals = model.datasource.signals;
        modelOut.states = model.states;

        res.json({
          model: modelOut
        });
      });
    }
  });
}