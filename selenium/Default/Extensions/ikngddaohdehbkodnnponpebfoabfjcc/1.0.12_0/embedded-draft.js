__sherpa.setDraft = () => {
  if(window.__sherpa.extensionEnable) {
    __sherpa.draft = true;
  }
};
__sherpa.checkStatusFunctions.push( () => {
  __sherpa.setDraft();
});
__sherpa.setDraft();
