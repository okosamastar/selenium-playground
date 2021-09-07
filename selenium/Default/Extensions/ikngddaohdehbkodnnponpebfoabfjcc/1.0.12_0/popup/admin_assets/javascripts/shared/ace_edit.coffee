window.initAceEditorForm = (form)->
  setupAceEditor = (id, lang) ->
    editor = ace.edit id
    editor.setTheme "ace/theme/chrome"
    editor.setFontSize 14
    editor.setAutoScrollEditorIntoView true
    editor.setOption("maxLines", 50)
    editor.setOption("minLines", 2)
    editor.getSession().setMode "ace/mode/#{lang}"
    editor.getSession().setUseWrapMode true
    editor.getSession().setTabSize 2

    input = $("##{id}").parent().find 'textarea.form-control'
    $("##{id}").bind 'selected', ()->
      editor.setValue input.val()
      editor.moveCursorTo(0, 0)
    $(".ace-edit").trigger('selected')
    prev = editor.getValue()
    setInterval ()->
      text = editor.getValue()
      if prev != text
        input.val text
        input.trigger('ace-change')
        prev = text
    , 500
  $(".ace-edit").each (index, element) ->
    setupAceEditor element.id, $(element).attr('mode')

  widgetActionTypeElem = form.find('.action_type select')
  selectWidgetSettings = ()->
    return if widgetActionTypeElem.length == 0
    newActionType = widgetActionTypeElem.val()
    $('#widget_settings > *').hide()
    $('#widget_settings *:input').attr('disabled', 'disabled')
    $("##{newActionType}").show()
    $("##{newActionType} .ace-edit").trigger('selected')
    $("##{newActionType} *:input").removeAttr('disabled')
  setTimeout ()->
    selectWidgetSettings()
  0
  widgetActionTypeElem.change () ->
    selectWidgetSettings()
