var populateProjectList = function(data) {
  console.log(data);
  $("#projectlisttable tr").remove();
  $("#projectlist li").remove();
  if (data.status > 0) {
    var projects = data.projects;
    // Set up the list of options in strategy
    $.each(projects, function(key, project) {

      var projectId = project._id;
      var projectName = project.name;
      var projectDesc = project.description;
      var projectCreatedAt = project.createdAt;
      if (projectDesc === '')
        projectDesc = 'No description';

      // Construct the table

      var newRow = '<li class="list-group-item"><div class="checkbox"><label for="checkbox">' +
        '<a href="/projects/' + projectId + '">' +
        '<div><strong>' + projectName + '</strong> | ' + projectDesc + '</div>' +
        '</a>' +
        '</label></div>' +
        '<div class="pull-right action-buttons">' +
        '<span class="glyphicon glyphicon-trash" id="delete_strategy" data-strategy-id="' + projectId + '" ></span>' +
        '</div></li>';
      $("#projectlist").append(newRow);

    });
  } else {
    var newRow = '<tr><td>' +
      'You have no projects' +
      '</td></tr>';
    $("#projectlisttable").append(newRow);
  }
}


var getProjects = function() {
  $.get('/projects', populateProjectList);
}


$(function() {
  getProjects();
})




$(function() {
  $('body').on('click', '#delete_project', function(e) {
    e.preventDefault();

    var strategy_id = $(this).data("strategy-id");
    console.log(strategy_id);

    $.ajax({
      type: 'POST',
      url: '/projects/delete/' + project_id,
      dataType: "json",
      async: true,
      success: getProjects()
    });

  });

});