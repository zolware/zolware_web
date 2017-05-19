var success = function() {
  window.location.reload(true);
}


var create_form_html_cols = function(val) {
  $("#signal_properties").empty();
  for (i = 1; i <= val; i++) {

    var row =
      '<hr> \
       <div class="col-md-12"> \
    <div class="form-group row"> \
      <!-- Signal name --> \
      <div class="col-md-4"> \
        <label for="signal_name' + '" class="col-form-label">Signal name ' + i + '</label> \
      </div> \
      <div class="col-md-8"> \
        <input type="text" class="form-control" name="signal_name' + '" id="signal_name' + '" value="signal' + i + '"> \
      </div> \
    </div> \
    <div class="form-group row"> \
      <!-- Signal timestep --> \
      <div class="col-md-4"> \
        <label for="signal_dt" class="col-form-label">Timestep (min)</label> \
      </div> \
      <div class="col-md-8"> \
        <input type="text" class="form-control" name="signal_dt' + '" id="signal_dt' + '" value="1440"> \
      </div> \
    </div> \
    <div class="form-group row"><!-- Signal linear --> \
      <div class="col-md-4"> \
        <label for="linear_gradient" class="col-form-label">Linear gradient</label> \
      </div> \
      <div class="col-md-8"> \
        <input type="text" class="form-control" name="linear_gradient' + '" id="linear_gradient' + i + '" placeholder="" value="0"> \
      </div> \
    </div> \
    <div class="form-group row"><!-- Signal periodic --> \
      <div class="col-md-4"> \
        <label for="inputEmail3" class="col-form-label">Periodic component</label> \
      </div> \
      <div class="col-md-4"> \
        <input type="text" class="form-control" name="periodic_mag' + '" id="periodic_mag' + i + '" placeholder="Magnitude" value="0"> \
      </div> \
      <div class="col-md-4"> \
        <input type="text" class="form-control" name="periodic_period' + '" id="periodic_period' + i + '" placeholder="Period" value="0"> \
      </div> \
    </div> \
    <hr> \
  </div>'

    $("#signal_properties").append(row);
  }

}

/*
$(function() {
  $('body').on('click', '#delete_project_phase', function(e) {
    e.preventDefault();

    var project_id = $(this).data("project");
    var project_phase_id = $(this).data("projectphase");
    $.ajax({
      type: 'POST',
      url: '/project/' + project_id + '/deletephase/' + project_phase_id,
      dataType: "json",
      async: true,
      success: success
    });
  });
});

*/

var populateComponentTypes = function(data) {
  var options = $("#componentType");

  if (data.status > 0) {
    var componentTypes = data.componentTypes;
    // Set up the list of options in strategy
    $.each(componentTypes, function(key, type) {
      options.append($("<option />").val(type.name).text(type.name));
      console.log(type);
    });
  }
};


$(function() {
  create_form_html_cols(1);
});


var populateComponentTable = function(data) {
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
}


//$(function() {
//  var project_id = $('body').data("project");

//  $.get('/project/' + project_id + '/components', populateComponentTable2);
//});





$(function() {
  $('body').on('click', '.delete_component', function(e) {
    e.preventDefault();

    alert("egg");

    var project_id = $('body').data("project");
    var component_id = $(this).data("component");

    console.log(project_id);
    console.log(component_id);

    $.ajax({
      type: 'POST',
      url: '/component/' + component_id + '/delete',
      dataType: "json",
      async: true,
      success: populateComponentTable
    });
  });
});






$(function() {
  $('body').on('change', '#datasource_type', function(e) {
    e.preventDefault();
    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;

    if (valueSelected == 'test_signal')
      $("#test_signals").show();
    else
      $("#test_signals").hide();
  });
});





$(function() {
  $('body').on('change', '#number_cols', function(e) {
    e.preventDefault();
    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;

    create_form_html_cols(valueSelected);

  });
});


$(function() {
  //alert(len($("#dd")));
  $("#showAddDatasourceForm").click(function(e) {
    e.preventDefault();
    $("#add_datasource_form").toggle();
  });
});



$(function() {
  $('body').on('click', '#delete_datasource', function(e) {
    e.preventDefault();
    if (confirm("Are you sure?")) {
      var datasource_id = $(this).data("datasource_id");
      $.ajax({
        type: 'POST',
        url: '/datasources/delete/' + datasource_id,
        dataType: "json",
        async: true,
        success: success
      });
    }
  });
});


$(function() {
  $('#confirm-delete').on('click', '.btn-ok', function(e) {
    e.preventDefault();
    var project_id = $('body').data("project_id");
    $.ajax({
      type: 'POST',
      url: '/projects/delete/' + project_id,
      dataType: "json",
      async: true,
      success: function(data, textStatus) {
        window.location.href = data.redirect;
      }
    });
  });
});