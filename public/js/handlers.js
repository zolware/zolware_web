modelApp.handlers = {


	addFullModelComponents: function(e) {
		var model_id = $('body').data("model_id");
		e.preventDefault();

		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/addpresetcomponents?preset_type=full',
			dataType: "json",
			async: true,
			success: success
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
			success: success
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
			success: success
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
		console.log(model_id);
		$.ajax({
			type: 'POST',
			url: '/models/' + model_id + '/components/deleteall',
			dataType: "json",
			async: true,
			success: success
		});
	},

};