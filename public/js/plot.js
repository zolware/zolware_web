$(document).ready(function() {
  $(':checkbox').change(function() {
    GetChartData();
  });
});


var configChart = function(data) {
  var d = data.data[0];
  var config = {
    type: 'line',
    data: {
      datasets: []
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: "Chart.js Time Point Data"
      },
      scales: {
        xAxes: [{
          type: "time",
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Value"
          }
        }]
      }
    }
  };

  var datasetsData = data.data;

  var signals = $('#signal_select :checkbox:checked').map(function() {
    return this.value;
  }).get();

  for (ds = 0; ds < datasetsData.length; ds++) {
    var dataset = datasetsData[ds];
   // if (signals.includes(dataset.signal)) {
      var dat = {
        data: []
      };
      dat.fill = false;
      dat.label = dataset.name;
      dat.lineTension = 0.1;
      for (i = 0; i < dataset.values.length; i++) {
        dat.data.push({
          x: moment(dataset.dates[i]),
          y: dataset.values[i]
        });
      }
      config.data.datasets.push(dat);
  //  }
  }
  
  config.options.title.text = "sdasasd";
  var ctx = document.getElementById("canvas").getContext("2d");
  window.myLine = new Chart(ctx, config);
}


var GetChartData = function() {
  var datasource_id = $('body').data("datasource_id");
  $.ajax({
    url: '/datasources/' + datasource_id + '/getdata',
    method: 'GET',
    dataType: 'json',
    success: function(d) {
      chartData = {
        labels: d.AxisLabels,
        datasets: [{
          fillColor: "rgba(220,220,220,0.5)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          data: [d.data.datetimes, d.data.values]
        }]
      };
      max = Math.max.apply(Math, d.data.values);
      steps = 10;
      configChart(d);
    }
  });
};

window.onload = function() {
  GetChartData();
}
