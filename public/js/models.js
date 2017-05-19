


$(function() {
	$('body').on('click', '#btn-ok-delete-model', function(e) {
		e.preventDefault();
		var model_id = $(this).data("model_id");
    
    console.log(model_id);
    
// 		$.ajax({
// 			type: 'POST',
// 			url: '/models/' + model_id + '/deletecomponent/' + component_id,
// 			dataType: "json",
// 			async: true,
// 			success: success
// 		});
	});
});