__sherpa.setEnableNativeAdCtrl = () => {
  if(window.__sherpa.extensionEnable) {
    __sherpa.enableNativeAdCtrl = true;

    var xhrRequest = function(url, method, type, formData, done) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
          if( xhr.status == 200){
            return done(null, xhr.response);
          }
          return done('Failure', {});
        }
      };
      xhr.open(method, url, true);
      xhr.withCredentials = true;
      xhr.responseType = type;
      xhr.send(formData);
    };

    var element = document.querySelector('script#embedded-native-ad-ctrl');
    var adminUrl = element.getAttribute('admin_url');
    var iconAdBlock = element.getAttribute('icon_ad_block');
    var style = document.querySelector('style.sherpa-native-ad-ctrl');
    if(style) {
      style.remove();
    }
    style = document.createElement('style');
    style.classList.add('sherpa-native-ad-ctrl');
    style.textContent = `.sherpa .sherpa-native-ad-control-component{position: relative;} .sherpa input.sherpa-native-ad-control-button {z-index: 99999999; position: absolute; top:0px; right:5px; width:38px; height:38px;background-image: url(${iconAdBlock});background-color:initial;border:none}`;
    document.head.appendChild(style);
  
    setInterval(function(){
      var widgets = document.querySelectorAll('.sherpa-widget:not(.sherpa-native-ad-control)');
      for(var widget of widgets) {
        widget.classList.add('sherpa-native-ad-control');
        var components = widget.querySelectorAll('.sherpa-component[data-ad_type="0"]:not(.sherpa-native-ad-control)');
        for(var component of components) {
          var advertisementId = component.dataset.mid;
          component.classList.add('sherpa-native-ad-control');
          var rand = 'sherpa_nac' + String(Math.random()).replace('.', '');
          xhrRequest(`${adminUrl}/native_ad_ctrl_partial/${window.__sherpa.siteKey}/${advertisementId}?rand=${rand}`, 'GET', 'html', null, function(err, response) {
            var nativeAdCtrlElement = document.createElement('div');
            nativeAdCtrlElement.classList.add('sherpa-native-ad-control-component');
            nativeAdCtrlElement.innerHTML = response;
            component.innerHTML = nativeAdCtrlElement.outerHTML + component.innerHTML;
            document.querySelector(`input.${rand}`).addEventListener('click', function(e){
              e.preventDefault();
              if(confirm('【広告停止】\nこの広告の配信を停止します。よろしいですか？\n※停止処理には数分かかる事があります。\n※再開刷る場合は、craft.管理画面の「配信管理」から設定をお願いします。')) {
                var form = document.querySelector(`form.${rand}`);
                xhrRequest(form.action, 'PATCH', 'json', new FormData(form), function(err, response){
                  if(err) {
                    return alert('配信停止に失敗しました。');
                  }
                  return alert('配信を停止しました。');
                });
              }
            });
          });
        }
      }
    }, 500);
  }
}
__sherpa.checkStatusFunctions.push( () => {
  __sherpa.setEnableNativeAdCtrl();
});
__sherpa.setEnableNativeAdCtrl();
