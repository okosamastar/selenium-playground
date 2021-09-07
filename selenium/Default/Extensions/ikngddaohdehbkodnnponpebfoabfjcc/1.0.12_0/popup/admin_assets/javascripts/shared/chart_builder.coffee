class ChartBuilder
  PLUGINS = {
    colorschemes: {
      scheme: 'brewer.Paired12'
    }
  }
  LINE_COLORS = ['#68B3C8', '#F3BB45', '#EB5E28', '#7AC29A', '#368196', '#c0870c', '#bb4111', '#408c62']
  LINE_SCALES = {
    pv: {
      yAxes: [{
        id: 'y-axes-1',
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'PV'
        }
        ticks: {
          beginAtZero:true
        }
      },{
        id: 'y-axes-2',
        position: 'right',
        scaleLabel: {
          display: true,
          labelString: '平均滞在時間(s)'
        }
        ticks: {
          beginAtZero:true,
        },
        gridLines: {
          drawOnChartArea: false,
        },
      }]
    },
    widget: {
      yAxes: [{
        id: 'y-axes-1',
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'In-View'
        }
        ticks: {
          beginAtZero:true
        }
      },{
        id: 'y-axes-2',
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'Click'
        }
        ticks: {
          beginAtZero:true
        },
        gridLines: {
          drawOnChartArea: false,
        },
      },{
        id: 'y-axes-3',
        position: 'right',
        scaleLabel: {
          display: true,
          labelString: 'CTR'
        }
        ticks: {
          beginAtZero:true,
          callback: (value, index, values) ->
            return value + '%'
        },
        gridLines: {
          drawOnChartArea: false,
        },
      }]
    },
    percent: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          callback: (value, index, values) ->
            return value + '%'
        }
      }]
    },
    advertising: {
      yAxes: [{
        id: 'y-axes-1',
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'Vimp'
        }
        ticks: {
          beginAtZero:true
        }
      },{
        id: 'y-axes-2',
        position: 'right',
        scaleLabel: {
          display: true,
          labelString: 'CTR'
        }
        ticks: {
          beginAtZero:true,
          callback: (value, index, values) ->
            return value + '%'
        },
        gridLines: {
          drawOnChartArea: false,
        },
      },{
        id: 'y-axes-3',
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'CPC'
        }
        ticks: {
          beginAtZero:true
        },
        gridLines: {
          drawOnChartArea: false,
        },
      },{
        id: 'y-axes-4',
        position: 'right',
        scaleLabel: {
          display: true,
          labelString: '見込み収益'
        }
        ticks: {
          beginAtZero:true,
        },
        gridLines: {
          drawOnChartArea: false,
        },
      }]
    }
  }
  DEFAULT_OPTIONS = {
    line: {
      maintainAspectRatio: false,
      responsive: true,
      legend: {
        position: 'bottom',
        labels: {
          fontSize: 11,
          usePointStyle: true,
          generateLabels: (chart) ->
            chart.data.datasets.map((dataset, i) ->
              {
                text:           dataset.label,
                fillStyle:      dataset.borderColor,
                hidden:         !chart.isDatasetVisible(i),
                lineCap:        dataset.borderCapStyle,
                lineDash:       [],
                lineDashOffset: 0,
                lineJoin:       dataset.borderJoinStyle,
                lineWidth:      0,
                strokeStyle:    dataset.borderColor,
                pointStyle:     dataset.pointStyle,
                datasetIndex:   i
              }
            )
        }
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (tooltipItems, data) ->
            if (data.datasets[tooltipItems.datasetIndex].label == 'CTR')
                return data.datasets[tooltipItems.datasetIndex].label + "：" + tooltipItems.yLabel + "%"
            return data.datasets[tooltipItems.datasetIndex].label + "：" + tooltipItems.yLabel
        }
      },
    },
    doughnut: {
      maintainAspectRatio: false,
      legend: {
        position: 'bottom'
        labels: {
          fontSize: 11,
          usePointStyle: true
        }
      }
    }
  }

  DATA_LABEL_PLUGIN = {
    afterDatasetsDraw: (chart, easing) ->
      ctx = chart.ctx
      chart.data.datasets.forEach (dataset, i) ->
        dataSum = 0
        dataset.data.forEach (element) ->
          dataSum += element

        meta = chart.getDatasetMeta(i)
        if !meta.hidden
          meta.data.forEach (element, index) ->
            ctx.fillStyle = 'rgb(0, 0, 0)'
            fontSize = 12
            fontStyle = 'normal'
            fontFamily = 'sans-serif'
            ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily)
            dataString = (Math.round(dataset.data[index] / dataSum * 1000)/10).toString() + "%"
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            padding = 5
            position = element.tooltipPosition()
            ctx.fillText dataString, position.x, position.y + (fontSize / 2) - padding
  }

  constructor: (@target, @type, @labels, datasets, options = {}) ->
    @datasets = []
    if @type == 'doughnut'
      @datasets.push({data: datasets})
    else
      count = 1
      for key, value of datasets
        dataset = {
          label: key,
          data: value,
          fill: false,
          borderColor: LINE_COLORS[count - 1],
          pointBackgroundColor: LINE_COLORS[count - 1],
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointRadius: 8,
          pointHoverRadius: 8,
        }
        if options.scaleType && !options.scaleOnly
          dataset.yAxisID = "y-axes-" + count
        @datasets.push(dataset)
        count++

    @options = DEFAULT_OPTIONS[@type]
    if options.title
      @options.title = { display: true, fontSize: 14, text: options.title }
    if options.scaleType
      @options.scales = LINE_SCALES[options.scaleType]
    else
      @options.scales = {}
    @options.plugins = PLUGINS

    if @type == 'doughnut'
      @plugins = [DATA_LABEL_PLUGIN]

  build: () ->
    ctx = $(@target)
    chart = new Chart(ctx, {
      type: @type,
      data: {
        labels: @labels,
        datasets: @datasets
      },
      plugins: @plugins,
      options: @options
    })
    chart.canvas.parentNode.style.height = '400px'

document.ChartBuilder = ChartBuilder
