class OrderedList
  constructor: (@selector, @callback) ->
    $(@selector).on 'click', '.remove_item', (e) =>
      e.preventDefault()
      if !confirm('削除してもよろしいですか？')
        return
      $(e.currentTarget).closest('.list_item').remove()
      @normalizeOrder()

    $(@selector).on 'click', '.forward_item', (e) =>
      e.preventDefault()
      count = @countItems()
      from = $(e.currentTarget).closest('.list_item')
      position = parseInt(from.find('.position').first().val())
      if count == 1 || position == 1
        return alert '一番上の要素です'
      to = from.prev('.list_item')
      from.insertBefore(to)
      @normalizeOrder()

    $(@selector).on 'click', '.backward_item', (e) =>
      e.preventDefault()
      count = @countItems()
      from = $(e.currentTarget).closest('.list_item')
      position = parseInt(from.find('.position').first().val())
      if count == 1 || position == count
        return alert '一番下の要素です'
      to = from.next('.list_item')
      from.insertAfter(to)
      @normalizeOrder()

  normalizeOrder: ->
    $(@selector + ' .display_position').each (i) -> $(this).text('' + (i + 1))
    $(@selector + ' .item_info .position').each (i) -> $(this).val('' + (i + 1))
    @callback() if @callback

  countItems: ->
    $(@selector + ' .display_position').length

window.OrderedList = OrderedList
