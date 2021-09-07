if(window.__sherpa.extensionEnable) {
  __sherpa.enableNativeAdCtrl = false;
  var style = document.querySelector('style.sherpa-native-ad-ctrl');
  if(style) {
    style.remove();
  }
  style = document.createElement('style');
  style.classList.add('sherpa-native-ad-ctrl');
  style.textContent = `.sherpa .sherpa-native-ad-control-component{display: none;}`;
  document.head.appendChild(style);
}
