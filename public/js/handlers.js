modelApp.handlers = {


	addFullModelComponents: function(e) {
		var model_id = $('body').data("model_id");
		e.preventDefault();

		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/addpresetcomponents?preset_type=full',
			dataType: "json",
			async: true,
			success: modelApp.modelcode.success
		});
	},


	addMatrix: function(e) {
		var model_id = $('body').data("model_id");
		e.preventDefault();
		var data = {
			"name": "New matrix"
		};

		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/addcomponent?component_type=matrix',
			dataType: "json",
			data: data,
			async: true,
			success: modelApp.modelcode.success
		});
	},


	addVector: function(e) {
		var model_id = $('body').data("model_id");
		e.preventDefault();
		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/addcomponent?component_type=vector',
			dataType: "json",
			async: true,
			success: modelApp.modelcode.success
		});
	},

	deleteModel: function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		// var signal_id = $('#delete_signal').data("signal_id");
		console.log(model_id);
		$.ajax({
			type: 'POST',
			url: '/models/delete/' + model_id,
			dataType: "json",
			async: true,
			success: function(data, textStatus) {
				window.location.href = '/models';
			}
		});
	},


	deleteAllComponentsFromModel: function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		// var signal_id = $('#delete_signal').data("signal_id");
		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/components/deleteall',
			dataType: "json",
			async: true,
			success: modelApp.modelcode.success
		});
	},


	changeDatasourceForModel: function(e) {
		e.preventDefault();
		var selected = $('select').find('option:selected');
		var datasource_id = $(this).find(':selected').data('datasource_id');
		var model_id = $('body').data("model_id");
		modelApp.modelcode.saveModelDataSource(model_id, datasource_id);
		modelApp.modelcode.getSignalNamesFromDataSource(datasource_id);
		modelApp.modelcode.getModel();
	},


	removeState: function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		var state_id = $(this).data("state-id");
		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/deletestate/' + state_id,
			dataType: "json",
			async: true,
			success: modelApp.view.renderStates
		});
	},


	addState: function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		var state_name = $('state_name').val();
		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/addstate',
			//	dataType: "json",
			async: true,
			data: $('#add_state_form').serialize(),
			success: modelApp.view.renderStates
		});
	},


	toggleAddState: function(e) {
		e.preventDefault();
		$('#add_state_dropdown').show();
	},


	deleteComponent: function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		var component_id = $(this).data("component_id");
		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/deletecomponent/' + component_id,
			dataType: "json",
			async: true,
			success: modelApp.modelcode.success
		});
	},


	deleteDatasource: function(e) {
		e.preventDefault();
		if (confirm("Are you sure?")) {
			var datasource_id = $(this).data("datasource_id");
			$.ajax({
				type: 'POST',
				url: '/datasources/delete/' + datasource_id,
				dataType: "json",
				async: true,
				success: modelApp.modelcode.success
			});
		}
	},



	runModel: function(e) {
		e.preventDefault();
		var model_id = $('body').data("model_id");
		$.ajax({
			type: 'POST',
			url: '/models/run/' + model_id,
			dataType: "json",
			async: true,
			success: modelApp.modelcode.afterRunModel
		});
	},


	showAddDatasourceForm: function(e) {
		e.preventDefault();
		$("#add_datasource_form").toggle();
	},


	changeComponentType: function(e) {
		e.preventDefault();
		var component_type = $(this).val();
		if (component_type === 'vector') {
			$("#cols_group").hide();
			$("#rows_group").show();
		} else {
			$("#cols_group").show();
			$("#rows_group").show();
		}
	},


};