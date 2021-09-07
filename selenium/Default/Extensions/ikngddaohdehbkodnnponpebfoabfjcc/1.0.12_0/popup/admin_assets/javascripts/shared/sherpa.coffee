$(document).ready ()->
  $('[data-toggle="tooltip"]').tooltip()

  if location.hash
    $("a[href=\"#{location.hash}\"]").click()

  $(window).load ->
    window.setTimeout("$('.alert').fadeOut()", 8000)

    $('.changed-observer input, .changed-observer textarea').each (i, elem) ->
      changedHighlight(this)

changedHighlight = (elem) ->
  $elem = $(elem)
  return if $elem.attr('readonly')
  if $elem.attr('type') == 'hidden'
  else if !$elem.data('old-value')
  else if $elem.attr('type') == 'checkbox'
    if $elem.prop('checked') != !!$elem.data('old-value')
      $elem.closest('.changed-observer').addClass 'changed'
    else
      $elem.closest('.changed-observer').removeClass 'changed'
  else if $elem.val() != String($elem.data('old-value'))
    $elem.closest('.changed-observer').addClass 'changed'
  else
    $elem.closest('.changed-observer').removeClass 'changed'

document.adjustModalClose = (modal) ->
  $(modal).on 'hidden.bs.modal', ->
    if $(this).is(':visible')
      $('body').addClass 'modal-open'
    else
      $(this).find('.modal.in').each ->
        $(this).modal('hide')
  $(modal).on 'shown.bs.modal', ->
    if $(this).is(':visible') and $(this).parents('.modal').size() >= 1
      $(this).css('top', $(this).parents('.modal').scrollTop())

$ ->
  $('.changed-observer').on 'change', 'input,textarea', (e) ->
    changedHighlight(this)
  $('.nav.nav-tabs a').click (e)->
    location.hash = new URL(e.currentTarget.href).hash

document.observeAsyncSaveReturnUrl = () ->
  asyncSaveReturnUrl = () ->
    $.ajax
      url: "/async_save_return_url"
      method: 'GET'
      data: {
        return_url: String(location)
      }
  $(window).on 'hashchange', (e) =>
    asyncSaveReturnUrl()
  asyncSaveReturnUrl()


prefixCandidates = ['', 'webkit','o', 'ms']
for prefixCandidate in prefixCandidates
  if prefixCandidate == '' && document.hidden != undefined
    document.adminBrowserPrefix = ''
    document.adminBrowserHidden = 'hidden'
    break
  else if document[prefixCandidate + 'Hidden'] != undefined
    document.adminBrowserPrefix = prefixCandidate
    document.adminBrowserHidden = prefixCandidate + 'Hidden'
    break

tagidKey = 'adminTabId'
sendTabid = () ->
  tagid = window.sessionStorage.getItem(tagidKey)
  if !tagid
    tagid = String(Math.random()).replace('.','')
    window.sessionStorage.setItem(tagidKey, tagid)
  $.ajax
    url: "/current_tabid"
    method: 'GET'
    data: {
      current_tabid: tagid
    }


$(document).bind document.adminBrowserPrefix + 'visibilitychange', (e) =>
  if !document[document.adminBrowserHidden]
    sendTabid()
if !window.sessionStorage.getItem(tagidKey)
  sendTabid()


document.jsFlash = (alertType, message) ->
  $('.ajax-flash').append """
    <div class='alert fade in alert-#{alertType}'>
      <a class='close' data-dismiss='alert'>&times;</a>
      <div>#{decodeURIComponent(message)}</div>
    </i>
  """
