$(document).ready ()->
  $('body').on 'click', '.advertisement_attribute-selector .all-select', (e) ->
    e.preventDefault()
    $(e.currentTarget).closest('.advertisement_attribute-selector').find('.parent input[type="checkbox"]').prop('checked', 'checked').change()
  $('body').on 'click', '.advertisement_attribute-selector .all-release', (e) ->
    e.preventDefault()
    $(e.currentTarget).closest('.advertisement_attribute-selector').find('.parent input[type="checkbox"]').prop('checked', false).change()
