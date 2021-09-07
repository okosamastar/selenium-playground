window.initWidgetForm = (form, baseUrl)->
  previewRequest = new PreviewRequest(form, baseUrl)

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
        prev = text
        previewRequest.request()
    , 3000
  $(".ace-edit").each (index, element) ->
    setupAceEditor element.id, $(element).attr('mode')
  setTimeout () ->
    previewRequest.request()
  , 1000

  return previewRequest
