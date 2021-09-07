class PreviewRequest
  requestStatus = null
  constructor: (@form, @baseUrl)->

  request: () ->
    self = @
    if requestStatus
      requestStatus = 'reserved'
      return
    requestStatus = 'requesting'
    $.post
      url: "#{@baseUrl}/generate_content",
      data: @form.serialize().replace('_method=patch', '_method=post')
      success: (result, textStatus, xhr) ->
        preview(result.action_type, result.content)
    .always ()->
      if requestStatus == 'reserved'
        requestStatus = null
        return self.request()
     requestStatus = null
window.PreviewRequest = PreviewRequest
