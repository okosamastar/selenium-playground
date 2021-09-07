window.initWidgetForm = (form, baseUrl)->
  initAceEditorForm(form)

  requestStatus = null
  previewRequest = () ->
    if requestStatus
      requestStatus = 'reserved'
      return
    requestStatus = 'requesting'
    $.post
      url: "#{baseUrl}/generate_content",
      data: form.serialize().replace('_method=patch', '_method=post')
      success: (result, textStatus, xhr) ->
        preview(result.action_type, result.content)
    .always ()->
      if requestStatus == 'reserved'
        requestStatus = null
        return previewRequest()
      requestStatus = null
  setTimeout () ->
    previewRequest()
  , 1000
  inputInterval = null;
  form.on 'focusin', '*:input', ()->
    input = $(this)
    prev = input.val();
    inputInterval = setInterval ()->
      text = input.val()
      if prev != text
        prev = text
        previewRequest()
    , 3000
    $(this).focusout ()->
      clearInterval(inputInterval);
  form.on 'ace-change', '*:input', ()->
    previewRequest()
