$(document).ready(function() {
  var url = window.location.search;
  var projectId;

  var updating = false;

  // If we have this section in our url, we pull out the post id from the url
  // In localhost:8080/new-project?project_id=1, projectId is 1
  if (url.indexOf('?project_id=') !== -1) {
    projectId = url.split('=')[1];
    getProjectData(projectId);
  }


  // Adding an event listener for when the form is submitted
  $('#new-job').on('submit', function handleFormSubmit(event) {
    event.preventDefault();

    // Giving the postCategorySelect a default value
    var status = $('#jobStatus').val();
    if (status === '') {
      status = 'Queued';
    }

    // Getting jQuery references to the post body, title, form, and category select
    var name = $('#jobName');
    var paint_cost = $('#paintPrice');
    var wood_rot = $('#woodRotPrice');
    var labor_actual = $('#actualLabor').val().trim();
    var material_actual = $('#actualMaterial').val().trim();
    var job_total = parseInt(paint_cost.val()) + parseInt(wood_rot.val());
    // Wont submit the post if we are missing a body or a title
    if (
      !name.val().trim() ||
      !paint_cost.val().trim() ||
      !wood_rot.val().trim()
    ) {
      return;
    }
    // Constructing a newPost object to hand to the database
    var newProject = {
      name: name.val().trim(),
      status: status,
      paint_cost: parseInt(paint_cost.val().trim()),
      wood_rot: wood_rot.val().trim(),
      labor_actual: labor_actual,
      material_actual: material_actual,
      job_total: job_total,
      pm_cost: .05 * job_total,
      sales_cost: .07 * job_total,
      labor_est: .35 * job_total,
      material_est: .15 * job_total,
      insurance_cost: .05 * .35 * job_total,
      profit_budget: job_total - job_total * (.05 + .07 + .35 + .15 + (.05*.35)),
      profit_actual: job_total - labor_actual - material_actual - job_total * (.05 + .07) - (.13 * labor_actual)
    };

    console.log(newProject);

    // DONE: this stuff here ->>>>>>>>>>>>>>>>>>>>>>>>>>>

    // If we're updating a post run updatePost to update a post
    // Otherwise run submitPost to create a whole new post
    if (updating) {
      newProject.id = projectId;
      updateProject(newProject);
    } else {
      submitProject(newProject);
    }
  });

  //DONE >>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<
  //submits a new project to the api route and takes user to the project page upon completion

  function submitProject(Project) {
    $.post('/api/project/new', Project, function() {
      window.location.href = '/projects';
    });
  }

  //DONE >>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<
  //gets the job data if we're editing it (get route from the api route)
  function getProjectData(id) {
    $.get('/api/projects/' + id, function(data) {
      if (data) {
        // If this post exists, prefill our cms forms with its data
        name.val(data.name);
        status.val(data.status);
        paint_cost.val(data.paint_cost);
        wood_rot.val(data.wood_rot);
        labor_actual.val(data.labor_actual);
        material_actual.val(data.material_actual);
        // If we have a post with this id, set a flag for us to know to update the post
        // when we hit submit
        updating = true;
      }
    });
  }

  //DONE >>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<
  //update with a "PUT" and take the user back to the projects page
  function updateProject(Project) {
    $.ajax({
      method: 'PUT',
      url: '/api/projects',
      data: Project
    }).then(function() {
      window.location.href = '/projects';
    });
  }
});
