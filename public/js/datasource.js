var populateDataSourceShareTable = function(data) {
  if (data.status > 0) {
    var sharetokens = data.sharetokens;

    var table = $('<table><col width="30%"><col width="40%"><col width="30%"></table>').addClass('table-striped custab');
    table.append('<thead><tr><th>User</th><th>Access token</th></tr><tr></tr></thead>');
    for (i = 0; i < sharetokens.length; i++) {
      var html = '<td>' + sharetokens[i].sharedWithUser + '</td>\
        <td>' + sharetokens[i].token + '</td>\
        <td><a id="delete_sharetoken" href="" \
        class="btn btn-danger btn-xs pull-right" \
        data-datasource_id="' + sharetokens[i]._id + '" \
        data-sharetoken_id="' + sharetokens[i]._id + '" \
        data-toggle="modal" data-target="#confirm-share-delete">  \
        <span class="glyphicon glyphicon-remove"></span></a></td></tr>';
      var row = $('<tr></tr>').addClass('bar').html(html);
      table.append(row);
    }

    $('#datasource_shares').append(table);


  }
}



$(function() {
  var datasource_id = $('body').data("datasource_id");
  $.ajax({
    type: 'GET',
    url: '/datasources/' + datasource_id + '/shares',
    dataType: "json",
    async: true,
    success: populateDataSourceShareTable
  });

});






$(function() {
  $("#showAddSignalForm").click(function(e) {
    e.preventDefault();
    $("#add_signal_form").toggle();
  });
});




$(function() {
  $('body').on('click', '#delete_sharetoken', function(e) {
    e.preventDefault();
    if (confirm("Are you sure?")) {
      var datasource_id = $('body').data("datasource_id");
      var sharetoken_id = $(this).data("sharetoken_id");
      console.log(datasource_id);
      console.log(sharetoken_id);
      $.ajax({
        type: 'POST',
        url: '/datasources/' + datasource_id + '/deleteshare/' + sharetoken_id,
        dataType: "json",
        async: true,
        success: window.location.href = '/datasources/' + datasource_id
      });
    }
  });
});





$(function() {
  $("#signal_type").change(function(e) {
    e.preventDefault();

    var selected = $('select').find('option:selected');
    var datasource_id = selected.data('datasource_id');
    var component_id = $(this).data("component_id");

    if ($(this).val() === "") {

    }

    $('#generated_signal').hide();
    $('#general_signal').hide();
    $('#sensor_signal').hide();
    $('#' + $(this).val()).show();

  });
});


$(function() {
  $("#sensor_data_source").change(function(e) {
    e.preventDefault();

    $('#data_source_file').hide();
    $('#data_source_rest').hide();
    
    $('#' + $(this).val()).show();

  });
});




$(function() {
  var today = moment().format("YYYY-MM-DD");
  var lastYear = moment(today).subtract(1, 'year');
  $('#start_date').val(lastYear.format("YYYY-MM-DD"));
});