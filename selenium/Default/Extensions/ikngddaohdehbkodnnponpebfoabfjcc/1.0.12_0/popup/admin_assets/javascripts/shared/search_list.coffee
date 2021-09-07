document.setListAppender = (table, basePath, paramName, callback) ->
  appender = $(table.next('.list_appender'))
  appender.children('i').hide()

  appending = false
  appendNext = () ->
    return if table.children('tbody').children('tr').length == 0
    return if appending
    appending = true
    appender.children('i').show()
    conditions = $('form.search_conditions').serializeArray()
    tbody = table.find(' > tbody')
    pageIndex = tbody.data('pageIndex')
    pageIndex++
    conditions.push {
     name: paramName
     value: pageIndex
    }
    $.get
      url: basePath
      data: conditions
      success: (result) ->
        if $(result).children().length > 0
          tbody.append($(result).children())
          tbody.data('pageIndex', pageIndex)
          appending = false
          callback() if callback
        else
          appender.children('i').hide()

  interval = setInterval ->
    if table.is(':visible') and ($(window).height() + window.scrollY - appender.offset().top) > 10
      appendNext()
  , 500

document.setItemListAppender = (itemContainer, appender, searchForm, basePath, paramName, callback) ->
  appender.children('i').hide()

  appending = false
  appendNext = () ->
    return if appending
    appending = true
    appender.children('i').show()
    conditions = searchForm?.serializeArray() ? []
    pageIndex = itemContainer.data('pageIndex')
    pageIndex++
    conditions.push {
      name: paramName
      value: pageIndex
    }
    $.get
      url: basePath
      data: conditions
      success: (result) ->
        if $(result).children().length > 0
          itemContainer.append($(result).children())
          itemContainer.data('pageIndex', pageIndex)
          appending = false
          callback() if callback
        else
          appender.children('i').hide()

  interval = setInterval ->
    if itemContainer.is(':visible') and ($(window).height() + window.scrollY - appender.offset().top) > 10
      appendNext()
  , 500
