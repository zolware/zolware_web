var request = require('request');
var config = require('../../config/app'); // use this one for testing

var Project = require('../models/project');



exports.plotDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  // Get the authenticated user
  var user = req.user;
  var output = req.query.output;

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
    var data = JSON.parse(body);
    if (is_ajax_request || output === 'json') {
      res.json(data);
    } else {
      res.render('plot.ejs', {
        user: user,
        data: data
      })
    }
  });
}


