var afterRunModel = function(data) {
	console.log(data);
}

var success = function() {
	window.location.reload(true);
}


var renderStates = function(data) {
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
		if(num_states !== zolwareModelApp.modelApp.Global.num_states) {
			 zolwareModelApp.modelApp.Global.isSaved = false;
		}
		
		zolwareModelApp.modelApp.Global.num_states = num_states;
		$('#states_title').html(" States (" + num_states + ")");
		$('#add_state_dropdown').hide();
		$('state_name').val("");
		loadComponents();
		getModel();
	}
}


var getStates = function() {
	var model_id = $('body').data("model_id");
	$.ajax({
		type: 'GET',
		url: '/models/' + model_id + '/getstates',
		dataType: "json",
		async: true,
		success: renderStates
	});
}


var getDataSource = function() {
	var selected = $('select').find('option:selected');
	var datasource_id = selected.data('datasource_id');
	var component_id = selected.data('component_id');
	var num_signals = selected.data('number_signals');
	zolwareModelApp.modelApp.Global.num_signals = num_signals;
	getStates();
}


var reloadPage = function() {
	getDataSource();
	zolwareModelApp.modelApp.Global.isSaved = true;
}


var saveComponentData = function(e) {
	var component_id = $(this).data("component_id");
	e.preventDefault();
	$.ajax({
		url: '/modelcomponents/' + component_id + '/setdata',
		type: 'post',
		dataType: 'json',
		data: $("#form-" + component_id).serialize(),
		success: function(data) {
			reloadPage
		}
	});
}


var getJSVector = function(data) {
	if (Array.isArray(data))
		return data;
	else {
		var dataVector = JSON.parse(data);
		return dataVector;
	}
}


var getJSMatrix = function(data) {
	if (Array.isArray(data))
		return data;
	else {
		var dataMatrix = JSON.parse(data);
		return dataMatrix;
	}
}


var render_matrix = function(id, data, num_rows, num_cols) {
	var values = getJSMatrix(data);
	var rowM = values.length;
	var colM = values[0].length;
	var table = "";
	table = table.concat('<table id="' + id + '"><tbody>');
	if (num_cols > 0 || num_rows > 0) {
		for (row = 0; row < num_rows; row++) {
			table = table.concat('<tr>');
			for (col = 0; col < num_cols; col++) {
				var value = (row<rowM && col<colM)?values[row][col] : 0;
				table = table.concat('<td><input type="text" size="2" autocomplete="off" name="' + id + '[' + row + '][' + col + ']" class="form-control input-sm" value = "' + value + '"></td>');
			}
		}
		table = table.concat('</tr>');
		table = table.concat('</tbody></table>');
	}
	return table;
}



var render_vector_component = function(vector, numRows) {
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
					html = html.concat(render_matrix('values', vector.values, numRows, 1));
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
}



var render_matrix_component = function(matrix, numRows, numCols) {
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
							html = html.concat(render_matrix('values',  matrix.values, numRows, numCols));
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
}


var populateComponents = function(data, signals) {
	
	var num_components = data.components.length;
	for (i = 0; i < num_components; i++) {
		var html = "";
		var component = data.components[i];
		if (component._type === "Matrix") {
			
			if(component.rows == "signals")
				component.rows = signals.length;
			if(component.rows == "states")
				component.rows = data.states.length;
			
			if(component.cols == "signals")
				component.cols = signals.length;
			if(component.cols == "states")
				component.cols = data.states.length;
			
			html = html.concat(render_matrix_component(component, component.rows, component.cols));
		} else if (component._type === "Vector") {
			if(component.rows == "signals")
				component.rows = signals.length;
			if(component.rows == "states")
				component.rows = data.states.length;
			html = html.concat(render_vector_component(component, component.rows));
		}
		html = html.concat('<br><br>');
		$("#component-" + data.components[i]._id).empty();
		$("#component-" + data.components[i]._id).append(html);
		$("#form-" + data.components[i]._id).submit(saveComponentData);
	}
}


var loadComponents = function() {
	var model_id = $('body').data("model_id");
	$.ajax({
		type: 'GET',
		url: '/models/' + model_id + '/components',
		dataType: "json",
		async: true,
		//success: populateComponents2
	});
}


var dd = function(data) {
	
	populateComponents(data.model, data.signals);
}


var getModel = function() {
	var model_id = $('body').data("model_id");
	$.ajax({
		type: 'GET',
		url: '/models/' + model_id,
		dataType: "json",
		async: true,
		success: dd
	});
}

$(function() {
	getModel();
});


var populateComponentTypes = function(data) {
	var options = $("#componentType");

	if (data.status > 0) {
		var componentTypes = data.componentTypes;
		// Set up the list of options in strategy
		$.each(componentTypes, function(key, type) {
			options.append($("<option />").val(type.name).text(type.name));
		});
	}
};



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



$(function() {
	$("#showAddDatasourceForm").click(function(e) {
		e.preventDefault();
		$("#add_datasource_form").toggle();
	});
});


$(function() {
	$("#run_model").click(function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		$.ajax({
				type: 'POST',
				url: '/models/run/' + model_id,
				dataType: "json",
				async: true,
				success: afterRunModel
			});
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
	$('body').on('click', '#delete_component', function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		var component_id = $(this).data("component_id");

		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/deletecomponent/' + component_id,
			dataType: "json",
			async: true,
			success: success
		});
	});
});



$(function() {
	reloadPage();
});


var saveModelDataSource = function(model_id, datasource_id) {
	$.ajax({
		type: 'POST',
		url: '/model/' + model_id + '/setdatasource/' + datasource_id,
		dataType: "json",
		async: true,
		success: reloadPage
	});
};

var populateSignalTable = function(data) {
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
}

var getSignalNamesFromDataSource = function(datasource_id) {
	$.ajax({
		type: 'GET',
		url: '/datasources/' + datasource_id + '/signals?depth=name',
		dataType: "json",
		async: true,
		success: populateSignalTable
	});
};




var saveModelDataSource = function(model_id, datasource_id) {
	$.ajax({
		type: 'POST',
		url: '/model/' + model_id + '/setdatasource/' + datasource_id,
		dataType: "json",
		async: true,
		success: reloadPage
	});
};



$(function() {
	$("#datasource").change(function(e) {
		e.preventDefault();
		var selected = $('select').find('option:selected');
		var datasource_id = $(this).find(':selected').data('datasource_id');
		var model_id = $('body').data("model_id");
		saveModelDataSource(model_id, datasource_id);
		getSignalNamesFromDataSource(datasource_id);
		getModel();
	});
});



$(function() {
	$("#component_type").change(function(e) {
		e.preventDefault();
		var component_type = $(this).val();
		if(component_type === 'vector') {
			$("#cols_group").hide();
			$("#rows_group").show();
		}
		else {
			$("#cols_group").show();
			$("#rows_group").show();
		}
	});
});



$(function() {
	$('body').on('click', '#add_state_toggle_button', function(e) {
		e.preventDefault();
		$('#add_state_dropdown').show();
	})
});


$(function() {
	$('body').on('click', '#add_state', function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		var state_name = $('state_name').val();
		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/addstate',
			//	dataType: "json",
			async: true,
			data: $('#add_state_form').serialize(),
			success: renderStates
		});
	})
});


$(function() {
	$('body').on('click', '#remove_state', function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		var state_id = $(this).data("state-id");
		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/deletestate/' + state_id,
			dataType: "json",
			async: true,
			success: renderStates
		});
	})
});