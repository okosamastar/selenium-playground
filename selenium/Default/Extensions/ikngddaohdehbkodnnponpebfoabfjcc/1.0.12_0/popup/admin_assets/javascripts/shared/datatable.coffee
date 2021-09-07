document.adoptSortable = () ->
  $('table.sortable').each ()->
    if !$(this).hasClass('dataTable')
      table = $(this).DataTable({paging: false, searching: false, info: false})
      defaultsort = $(this).data('defaultsort')
      if defaultsort
        table.order(defaultsort).draw()

$(document).ready ()->
  document.adoptSortable()
