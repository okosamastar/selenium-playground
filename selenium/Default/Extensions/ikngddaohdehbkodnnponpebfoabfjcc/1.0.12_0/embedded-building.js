__sherpa.setEnableBuilding = () => {
  if(window.__sherpa.extensionEnable) {
    __sherpa.enableBuilding = true;
  }
};
__sherpa.checkStatusFunctions.push( () => {
  __sherpa.setEnableBuilding();
});
__sherpa.setEnableBuilding();
