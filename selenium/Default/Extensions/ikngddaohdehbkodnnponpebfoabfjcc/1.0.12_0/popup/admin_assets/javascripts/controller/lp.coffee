anchorLink = location.hash
document.smoothScroll = (target) ->
  $dist        = $(target)
  headerHeight = 0
  if window.innerWidth <= 768
    headerHeight = $('header').outerHeight()
  position     = $dist.offset().top - headerHeight
  $('html,body').animate({ scrollTop: position }, 500, 'swing')

inView.threshold(0.1)

$ ->
  playDemo = (selector) ->
    inView(selector).once('enter', (element) ->
      $(element).find('.ui-demo-mock-movie video').get(0).play()
    )
  playDemo('#carouselDemo')
  playDemo('#slideshowDemo')
  playDemo('#scrollDemo')
  if anchorLink
    $('html,body').hide()
    setTimeout(() ->
      $('body,html').scrollTop(0).show()
      document.smoothScroll(anchorLink)
    , 100)

  $('#navBar').click ->
    $('header').toggleClass 'open'
    $('nav').slideToggle 500

