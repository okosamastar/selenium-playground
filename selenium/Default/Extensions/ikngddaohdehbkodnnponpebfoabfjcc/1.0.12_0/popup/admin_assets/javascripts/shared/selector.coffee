$ ->
  targetControl = (selectorType) ->
    target = selectorType.closest('.selector').find '.selector_name'
    if selectorType.val() == '0'
      target.addClass('hide');
      target.val('');
    else
      target.removeClass('hide');

  $('body').on 'change', '.selector_type', ()->
    targetControl $(this)

  $('body .selector_type').each ()->
    targetControl $(this)
