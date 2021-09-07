$ ->
  targetControl = (compareType) ->
    target = compareType.closest('.condition').find '.condition_target'
    target_genre = compareType.closest('.condition').find '.condition_target_genre'

    if parseInt(compareType.val()) == 2000
      target_genre.removeClass('hide')
      target_genre.find('.checkbox input[type="checkbox"]').each (index, element) =>
        $(element).checkbox()
      target.find('input[type="text"]').val('')
      target.addClass('hide')
    else
      target.removeClass('hide')
      target_genre.find('.checkbox input[type="checkbox"]').each (index, element) =>
        $(element).prop('checked', false)
      target_genre.addClass('hide')

  $('body').on 'change', '.condition_compare_type', ()->
    targetControl $(this)

  $('body .condition_compare_type').each ()->
    targetControl $(this)
