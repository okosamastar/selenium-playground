$(document).ready ()->
  $('body').on 'click', '.site_attribute-selector .all-select', (e) ->
    e.preventDefault()
    $(e.currentTarget).closest('.site_attribute-selector').find('.parent input[type="checkbox"]').prop('checked', 'checked').change()
  $('body').on 'click', '.site_attribute-selector .all-release', (e) ->
    e.preventDefault()
    $(e.currentTarget).closest('.site_attribute-selector').find('.parent input[type="checkbox"]').prop('checked', false).change()
