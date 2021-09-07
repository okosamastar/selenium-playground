$(document).ready ()->
  $('body').on 'click', '.prefecture-selector .district .all-select', (e) ->
    e.preventDefault()
    district = $(e.currentTarget).closest('.district')
    district.find('input[type="checkbox"]').prop('checked', true).change()
    district.find('.child.checkbox').addClass 'checked'
  $('body').on 'click', '.prefecture-selector .district .all-release', (e) ->
    e.preventDefault()
    district = $(e.currentTarget).closest('.district')
    district.find('input[type="checkbox"]').prop('checked', false).change()
    district.find('.child.checkbox').removeClass 'checked'
