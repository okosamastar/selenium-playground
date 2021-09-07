window.__sherpa = window.__sherpa || {};
__sherpa.checkStatusFunctions = []
window.__sherpa.afterPublishJsRun = () => {
  for(const checkStatusFunction of __sherpa.checkStatusFunctions) {
    checkStatusFunction();
  }
};
