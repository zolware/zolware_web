


var changeDatasourceType = function(e) {
		e.preventDefault();
		var data_source_type = $(this).val();
  console.log(data_source_type);
		if (data_source_type === 'data_source_file') {
			$("#data_source_file").show();
			$("#data_source_s3").hide();
		} else {
			$("#data_source_file").hide();
			$("#data_source_s3").show();
		}
	}


$("#data_source").change(changeDatasourceType);