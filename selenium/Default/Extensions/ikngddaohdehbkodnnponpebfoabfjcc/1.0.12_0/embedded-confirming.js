__sherpa.setEnableConfirming = () => {
  if(window.__sherpa.extensionEnable) {
    __sherpa.enableConfirming = true;
  }
};
__sherpa.checkStatusFunctions.push( () => {
  __sherpa.setEnableConfirming();
});
__sherpa.setEnableConfirming();
