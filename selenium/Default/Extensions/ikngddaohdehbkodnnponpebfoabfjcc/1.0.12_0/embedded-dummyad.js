__sherpa.setEnableDummyAd = () => {
  if(window.__sherpa.extensionEnable) {
    __sherpa.enableDummyAd = true;
  }
};
__sherpa.checkStatusFunctions.push( () => {
  __sherpa.setEnableDummyAd();
});
__sherpa.setEnableDummyAd();
