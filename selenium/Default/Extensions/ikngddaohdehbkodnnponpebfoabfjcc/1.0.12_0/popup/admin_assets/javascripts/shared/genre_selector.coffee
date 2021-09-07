$(document).ready ()->
  $('body').on 'click', '.genre-selector .all-select', (e) ->
    e.preventDefault()
    $(e.currentTarget).closest('.genre-selector').find('.parent input[type="checkbox"]').prop('checked', 'checked').change()
  $('body').on 'click', '.genre-selector .all-release', (e) ->
    e.preventDefault()
    $(e.currentTarget).closest('.genre-selector').find('.parent input[type="checkbox"]').prop('checked', false).change()
  $('body').on 'change', '.parent input[type="checkbox"]', (e) ->
    parent = $(e.currentTarget).closest('.parent')
    children = $(e.currentTarget).closest('.genre-group').find('.genre_box.child')
    childrenCheckbox = children.find('input[type="checkbox"]').prop('checked', $(e.currentTarget).prop('checked'))
    if $(e.currentTarget).prop('checked')
      parent.addClass 'checked'
      children.addClass 'checked'
      childrenCheckbox.bind 'click', (e) ->
        e.preventDefault()
    else
      parent.removeClass 'checked'
      childrenCheckbox.prop 'readonly', null
      childrenCheckbox.unbind 'click'
      children.removeClass 'checked'
