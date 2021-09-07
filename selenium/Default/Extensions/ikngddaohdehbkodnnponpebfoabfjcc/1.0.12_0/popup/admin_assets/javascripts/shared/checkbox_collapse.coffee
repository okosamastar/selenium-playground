$(document).ready ()->
  window.initCheckboxCollapse = (element) ->
    if $(element).prop('checked')
      $($(element).data('target')).show()
    else
      $($(element).data('target')).hide()

  $('body').on 'change', 'input.checkbox-collapse[type="checkbox"]', (e) ->
    element = $(e.target)
    if $(element).prop('checked')
      $($(element).data('target')).slideDown()
      $($(element).data('reversetarget')).slideUp()
    else
      $($(element).data('target')).slideUp()
      $($(element).data('reversetarget')).slideDown()
