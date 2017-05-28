modelApp.view = {

  
  populateDatasourcesSelect: function(data) {
    var datasource_id = $('#datasource_select').data("model_datasource");
    $("#datasource_select option").remove();

    if (data.status > 0) {
      var yourDatasources = data.datasources;
      var sharedDatasources = data.shared_datasources;

      $.each(yourDatasources, function(key, datasource) {
        var selectString = "";
        if (datasource_id.trim() === datasource._id.trim())
          selectString = "select";
        var option = '<option value="' + datasource._id + '" data-number_signals = "' + datasource.signals.length + '" data-datasource_id="' + datasource._id + '" ' + selectString + '>' + datasource.name + ' ('+datasource.signals.length+')</option>';
        $("#datasource_select").append(option);
      });

      $.each(sharedDatasources, function(key, datasource) {
        var selectString = "";
        if (datasource_id.trim() === datasource._id.trim())
          selectString = "select";
        var option = '<option value="' + datasource._id + '" data-number_signals = "' + datasource.signals.length + '" data-datasource_id="' + datasource._id + '" ' + selectString + '>' + datasource.name + ' (Shared) </option>';
        $("#datasource_select").append(option);
      });

    }

  },


  populateSignalTable: function(data) {
    console.log(data);
    $("#signals_table tr").remove();
    if (data.status > 0) {
      var signals = data.signals;
      $('#signals_title').html(" Signals (" + signals.length + ")");
      $.each(signals, function(key, signal) {
        var tableRow = '<tr><td>' + signal.name + '</td>' +
          '<td>' + signal.description + '</td>' +
          '</tr>';
        $("#signals_table").append(tableRow);
      });
    }
  },



  populateComponentTable: function(data) {
    $("#components_table tr").remove();
    if (data.status > 0) {
      var components = data.components;
      $.each(components, function(key, component) {
        var tableRow = '<tr><td><a href="">' + component.name + '</a></td>' +
          '<td>' + component.type + '</td>' +
          '<td>New</td>' +
          '<td class="text-center"><a class="btn btn-info btn-xs" href="/projects/editphase/"><span class="glyphicon glyphicon-edit"></span> Edit</a>' +
          '<a id="delete_project_phase" href="" class="btn btn-danger btn-xs delete_component" data-project="" data-component="' + component._id + '"><span class="glyphicon glyphicon-remove"></span> Del</a>' +
          '</td></tr>';
        $("#components_table").append(tableRow);
      });
    }
  },


  renderStates: function(data) {
    $('#state_table').empty();
    if (data.status > 0) {
      var newRows = "";
      var states = data.states;
      var num_states = 0;
      for (i = 0; i < states.length; i++) {
        var removeOrNot = (states[i].type !== "from signal") ? '<a id="remove_state" href="" class="btn btn-xs btn-primary" data-state-id="' + states[i]._id + '">Remove</a>' : '';
        $('#state_table').append('<tr><td>' + states[i].name + '</td><td>' + states[i].type + '<td/><td>' + removeOrNot + '</td></tr>');
        num_states++;
      }
      if (num_states !== zolwareModelApp.modelApp.Global.num_states) {
        zolwareModelApp.modelApp.Global.isSaved = false;
      }

      zolwareModelApp.modelApp.Global.num_states = num_states;
      $('#states_title').html(" States (" + num_states + ")");
      $('#add_state_dropdown').hide();
      $('state_name').val("");
      modelApp.modelcode.loadComponents();
      modelApp.modelcode.getModel();
    }
  },


  populateComponents: function(data, signals) {

    var num_components = data.components.length;
    for (i = 0; i < num_components; i++) {
      var html = "";
      var component = data.components[i];
      if (component._type === "Matrix") {

        if (component.rows == "signals")
          component.rows = signals.length;
        if (component.rows == "states")
          component.rows = data.states.length;

        if (component.cols == "signals")
          component.cols = signals.length;
        if (component.cols == "states")
          component.cols = data.states.length;

        html = html.concat(modelApp.view.render_matrix_component(component, component.rows, component.cols));
      } else if (component._type === "Vector") {
        if (component.rows == "signals")
          component.rows = signals.length;
        if (component.rows == "states")
          component.rows = data.states.length;
        html = html.concat(modelApp.view.render_vector_component(component, component.rows));
      }
      html = html.concat('<br><br>');
      $("#component-" + data.components[i]._id).empty();
      $("#component-" + data.components[i]._id).append(html);
      $("#form-" + data.components[i]._id).submit(modelApp.modelcode.saveComponentData);
    }
  },




  render_matrix: function(id, data, num_rows, num_cols) {
    var values = modelApp.modelcode.getJSMatrix(data);
    var rowM = values.length;
    var colM = values[0].length;
    var table = "";
    table = table.concat('<table id="' + id + '"><tbody>');
    if (num_cols > 0 || num_rows > 0) {
      for (row = 0; row < num_rows; row++) {
        table = table.concat('<tr>');
        for (col = 0; col < num_cols; col++) {
          var value = (row < rowM && col < colM) ? values[row][col] : 0;
          table = table.concat('<td><input type="text" size="2" autocomplete="off" name="' + id + '[' + row + '][' + col + ']" class="form-control input-sm" value = "' + value + '"></td>');
        }
      }
      table = table.concat('</tr>');
      table = table.concat('</tbody></table>');
    }
    return table;
  },


  render_vector_component: function(vector, numRows) {
    var html = "<div>";
    html = html.concat('<div class="row">');
    html = html.concat('<div class="col-md-6">');
    html = html.concat('<p>' + vector.name + '</p>');
    html = html.concat('</div>');
    html = html.concat('<div class="col-md-6">');
    html = html.concat('</div>');
    html = html.concat('</div>'); //row
    html = html.concat('<form id="form-' + vector._id + '" class="form-horizontal" data-component_id = "' + vector._id + '">');
    html = html.concat('<div class="row">');
    html = html.concat('<div class="col-md-6">');
    html = html.concat(modelApp.view.render_matrix('values', vector.values, numRows, 1));
    html = html.concat('</div>');
    html = html.concat('</div>'); //row

    html = html.concat('<div class="row">');
    html = html.concat('<div class="col-md-12">');
    html = html.concat('<br><input type="submit" class="btn btn-info btn-sm" value="Save">');
    html = html.concat('<a id="delete_component" href="" class="btn btn-danger btn-sm" data-component_id="' + vector._id + '"></span> Delete</a>');
    html = html.concat('</div>');
    html = html.concat('</div>');
    html = html.concat('<input type="hidden" name="_type" value="' + vector._type + '">');
    html = html.concat('</form>');
    html = html.concat('</div>');
    html = html.concat('<hr>');
    return html;
  },



  render_matrix_component: function(matrix, numRows, numCols) {
    var html = "";
    html = html.concat('<div>');
    html = html.concat('<div class="row">');
    html = html.concat('<div class="col-md-6">');
    html = html.concat('<p>' + matrix.name + '</p>');
    html = html.concat('</div>');
    html = html.concat('<div class="col-md-6">');
    html = html.concat('</div>');
    html = html.concat('</div>');

    html = html.concat('<div class="row">');
    html = html.concat('<div class="col-md-12">');
    html = html.concat('<form id="form-' + matrix._id + '" class="form-horizontal" data-component_id = "' + matrix._id + '">');
    html = html.concat('<div class="row">');
    html = html.concat('<div class="col-md-3">');
    html = html.concat(modelApp.view.render_matrix('values', matrix.values, numRows, numCols));
    html = html.concat('</div>');
    html = html.concat('</div>');

    html = html.concat('<div class="row">');
    html = html.concat('<div class="col-md-12">');
    html = html.concat('<br><input type="submit" class="btn btn-info btn-sm" value="Save">');

    html = html.concat('<a id="delete_component" href="" class="btn btn-danger btn-sm" data-component_id="' + matrix._id + '">Delete</a>');

    html = html.concat('</div>');
    html = html.concat('</div>');
    html = html.concat('<input type="hidden" name="_type" value="' + matrix._type + '">');
    html = html.concat('</form>');
    html = html.concat('</div>');
    html = html.concat('</div>');
    html = html.concat('</div>');
    html = html.concat('<hr>');
    return html;
  },



};