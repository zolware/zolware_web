var request = require('request');
var config = require('../../config/app'); // use this one for testing

var Project = require('../models/project');




exports.getSignalById = function(req, res) {
  var datasource_id = req.params.datasource_id
  var signal_id = req.params.signal_id
  var output = req.query.output;
  var user = req.user;

  var is_ajax_request = req.xhr;

  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'datasources/'+datasource_id+'/signals/' + signal_id,
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
        res.render('signal.ejs', {
          signal: data.signal,
          user: user,
          back_url: req.header('Referer')
        })
      }
    } else {
      res.status(404).send('Message not found');
    }
  });
}




exports.getDataFromDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id
  var signal_id = req.params.signal_id
    // Get the authenticated user
  var user = req.user;

  var ungrouped = (typeof req.query.ungrouped === 'undefined') ? "false" : req.query.ungrouped;
  var sortParam = (typeof req.query.sort === 'undefined') ? "asc" : req.query.sort;
  var sort = (sortParam === 'asc') ? 1 : -1;
  
  var options = {
    method: 'GET',
    uri: config.app.baseurl + config.api.url + 'datasources/'+datasource_id+'/getdata?ungrouped='+ungrouped+'&sort='+sort,
    headers: {
      'Content-Type': config.api.contentType,
      'Authorization': 'Bearer ' + user.token
    }
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
        res.json(data);
      }
  });
  
}

