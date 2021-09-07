__sherpa.checkSitekey = () => {
  window.__sherpa = window.__sherpa || {};
  var script = document.querySelector('script#embedded-check-sitekey');
  var sherpa = script.getAttribute('sherpa') == 'true';
  var sitekeys = script.getAttribute('sitekeys').split(',');

  window.__sherpa.extensionEnable = false;
  if(sherpa || sitekeys.indexOf(window.__sherpa.siteKey) >= 0) {
    window.__sherpa.extensionEnable = true;
  }
}
__sherpa.checkStatusFunctions.push( () => {
  __sherpa.checkSitekey();
});
__sherpa.checkSitekey();
