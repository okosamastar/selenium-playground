$ ->
  $('table.downloadable').each ->
    $(this).tableExport bootstrap: true, position: 'bottom', formats: ['csv'], fileName: $(this).data('name'), trimWhitespace: true

  $('.more-daily-report a').click (e) ->
    e.preventDefault()
    $(this).closest('.more-daily-report').hide()
    $(this).closest('.card').find('.daily-report').show()
