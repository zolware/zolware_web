var request = require('request');
var config = require('../../config/app'); // use this one for testing

var DataSource = require('../models/data_source');



exports.getAllDataSourcesForUser = function(req, res) {
  // Get the authenticated user
  var authenticatedUser = req.user;
  var output = req.query.output;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'datasources',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + authenticatedUser.token
    },
    qs: req.query,
  };

  request(options, function(error, response, body) {
    try {
      var data = JSON.parse(body);
      if (is_ajax_request || output === 'json') {
        res.json(data);
      } else {
        res.render('datasources.ejs', {
          datasources: data.datasources,
          shared_datasources: data.shared_datasources,
          user: authenticatedUser,
          back_url: req.header('Referer'),
          csrfToken: req.csrfToken()
        })
      }
    } catch (e) {
      res.status(400).send('Invalid JSON string')
    }


  });
}



exports.addDataSource = function(req, res) {
  var datasourceName = req.body.datasource_name;
  var datasourceDescription = req.body.datasource_description;
  var user = req.user;
  
  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'datasources/add',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: {
      datasource_name: datasourceName,
      datasource_description: datasourceDescription,
      user: user
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    res.redirect('/datasources');
  });
};











exports.getDataSourceById = function(req, res) {
  var datasource_id = req.params.datasource_id
  var output = req.query.output;
  var user = req.user;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'datasources/' + datasource_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      if (is_ajax_request || output === 'json') {
        res.json(data);
      } else {
        res.render('datasource.ejs', {
          datasource: data.datasource,
          user: user,
          back_url: req.header('Referer')
        })
      }



    } else {
      res.status(404).send('Message not found');
    }
  });
}





exports.editDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id
  var datasourcename = req.body.datasourcename;
  var datasourcedescription = req.body.datasourcedescription;
  var user = req.user;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'datasources/edit/' + datasource_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: {
      datasourcename: datasourcename,
      datasourcedescription: datasourcedescription
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    if (error)
      throw error;
    res.redirect('/datasources/' + datasource_id);
  });


};


exports.deleteDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  var user = req.user;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'datasources/delete/' + datasource_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    // if (is_ajax_request) {
    //   var data = JSON.parse(body);
    //   res.json(data);
    // }
    //  else {
    res.redirect('/datasources');
    //  }
  });
}



exports.getAllDataSourcesForProject = function(req, res) {
  var project_id = req.params.project_id
  var user = req.user;
  var output = req.query.output;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'project/' + project_id + '/datasources',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    res.json(data);
  });
}




exports.getAllSignalsFromDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id
    // Get the authenticated user
  var user = req.user;
  var depth = (req.query.depth !== undefined) ? req.query.depth : '';



  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'datasources/' + datasource_id + '/signals?depth=' + depth,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };


  request(options, function(error, response, body) {
    var data = JSON.parse(body);
    res.json(data);
  });


}



exports.addSignalToDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id
  var user = req.user;
  var output = req.query.output;
  var is_ajax_request = req.xhr;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'datasources/' + datasource_id + '/addsignal',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };



  request(options, function(error, response, body) {

    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      if (is_ajax_request || output === 'json') {
        res.json(data);
      } else {
        res.redirect('/datasources/' + datasource_id);
      }



    } else {
      res.status(404).send('Message not found');
    }
  });
}


exports.deleteSignalFromDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  var signal_id = req.params.signal_id;
  var user = req.user;
  var is_ajax_request = req.xhr;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'datasources/' + datasource_id + '/deletesignal/' + signal_id,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    if (is_ajax_request) {
      var data = JSON.parse(body);
      res.json(data);
    } else {
      res.redirect('/datasources/' + datasource_id);
    }
  });
}





// --- Datasource sharing


exports.addDataSourceShareToken = function(req, res) {
  var datasource_id = req.params.datasource_id
  var user = req.user;
  var output = req.query.output;
  var is_ajax_request = req.xhr;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'datasources/' + datasource_id + '/share',
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    },
    form: req.body
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      if (is_ajax_request || output === 'json') {
        res.json(data);
      } else {
        res.redirect('/datasources/' + datasource_id);
      }
    } else {
      res.status(404).send('Message not found');
    }
  });
}



exports.getAllShareTokensForDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id
  var user = req.user;
  var output = req.query.output;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'datasources/' + datasource_id + '/shares',
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
      res.redirect('/datasources/' + datasource_id);
    }
  });
}



exports.deleteShareTokenFromDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  var share_id = req.params.share_id;
  var user = req.user;
  var output = req.query.output;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'POST',
    uri: config.app.baseurl + config.api.url + 'datasources/' + datasource_id + '/deleteshare/' + share_id,
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
      res.redirect('/datasources');
    }
  });
}