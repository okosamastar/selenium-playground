$ ->
  $('body').on 'change', '.static_file_input', () ->
    parent = $(this).closest('.form-group')
    max = $(this).data('max')
    max_duration = $(this).data('max-duration')
    if this.files[0].size > max
      if (max/1024/1024) < 0
        alert 'アップロード出来るファイルは' + (max/1024) + 'KB迄です'
      else
        alert 'アップロード出来るファイルは' + (max/1024/1024) + 'MB迄です'
      parent.find('.static_file_input').val ''
    file_type = 'static'
    if this.files[0].type.indexOf('image') == 0
      file_type = 'image'
    else if this.files[0].type in ['video/mp4', 'application/mp4', 'application/octet-stream']
      file_type = 'movie'
    reader = new FileReader()
    reader.onload = (e) ->
      if file_type == 'image'
        $('<img />')
          .addClass 'img-thumbnail'
          .attr 'src', e.target.result
          .appendTo parent.find('.thumbnail-content').empty()
        $('<img />')
          .attr 'src', e.target.result
          .data 'dismiss', 'modal'
          .appendTo parent.find('.modal-content').empty()
        $('<img />')
          .addClass 'preview'
          .attr 'src', e.target.result
          .appendTo parent.closest('.image-input').find('.static-preview').empty()
      else if file_type == 'movie'
        $('<video />')
          .addClass 'img-thumbnail'
          .attr 'src', e.target.result
          .appendTo parent.find('.thumbnail-content').empty()
        $('<video />')
          .attr 'src', e.target.result
          .attr 'controls', true
          .attr 'loop', true
          .data 'dismiss', 'modal'
          .appendTo parent.find('.modal-content').empty()

        invalid_movie = (message) ->
          message ||= 'この動画ファイルはサポートされていません'
          parent.find('.static_file_input').val ''
          parent.find('.static_file_id_input').val ''
          parent.closest('.movie-input').find('.static-preview').empty()
          parent.closest('form').find('.btn-primary').removeAttr 'disabled'
          alert message

        # parent.closest('.movie-input').find('.movie_duration').val ''
        # $('<video />')
        #   .addClass 'preview'
        #   .attr 'src', e.target.result
        #   .attr 'controls', true
        #   .attr 'loop', true
        #   .bind 'loadedmetadata', (video_event) ->
        #     duration = video_event.target.duration
        #     if isNaN(duration) or duration == 0
        #       invalid_movie()
        #       return
        #     if max_duration and duration > max_duration
        #       invalid_movie('動画が長すぎます')
        #       return
        #     if duration  > 0
        #       $(this).closest('.movie-input').find('.movie_duration').val duration
        #       $(this).closest('.movie-input').find('.end-time').val "00:#{('0'+Math.floor(duration)).slice(-2)}" if duration < 15
        #       $(this).closest('form').find('.btn-primary').removeAttr 'disabled'
        #   .bind 'error', () ->
        #     # invalid_movie()
        #     return
        #   .appendTo parent.closest('.movie-input').find('.static-preview').empty().first()
        # $(this).closest('form').find('.btn-primary').attr 'disabled', 'disabled'

    reader.readAsDataURL this.files[0]


  $('.remove_image').click () ->
    parent = $(this).closest('.form-group')
    parent.find('.static_file_input').val ''
    parent.find('.static_file_id_input').val ''
    parent.find('.thumbnail-content').empty()
    parent.find('.modal-content').empty()
    parent.closest('.image-input').find('.static-preview').empty()
    parent.closest('.movie-input').find('.static-preview').empty()
    parent.closest('.movie-input').find('.movie_duration').val ''
