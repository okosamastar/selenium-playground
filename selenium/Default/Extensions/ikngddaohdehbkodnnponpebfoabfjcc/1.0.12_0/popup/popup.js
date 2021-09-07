$(document).ready(() => {
  var backgroundPage = chrome.extension.getBackgroundPage();
  var adminUrl = backgroundPage.adminUrl();
  backgroundPage.getLogin((err, loginResult) => {
    if(loginResult.login) {
      $('#login').html(`<a target="_blank", href="${adminUrl}/users/sign_in">${loginResult.login}</a>`);
      if(loginResult.sherpa) {
        $('body').addClass('admin');
      }
    } else {
      $('#login').html(`<a target="_blank", href="${adminUrl}/users/sign_in">ログインしてください</a>`);
    }
  });

  var env = backgroundPage.getEnv();
  $(`input[name="env"][value="${env}"]`).prop('checked', 'checked');
  $('input[name="env"]').on('change', (e) => {
    var env = $(e.currentTarget).val();
    backgroundPage.setEnv(env);
  });

  var isEnable = backgroundPage.getSherpaStatus();
  $('#sherpaEnable').prop('checked', isEnable);
  $('#sherpaEnable').on('change', (e) => {
    var isEnable = $('#sherpaEnable').prop('checked');
    backgroundPage.setSherpaStatus(isEnable);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          op: (isEnable ? 'enableSherpa' : 'disableSherpa')
        },
        (response) => {
        });
    });
  });

  var isBuilding = backgroundPage.getBuildingStatus();
  $('#buildingEnable').prop('checked', isBuilding);
  $('#buildingEnable').on('change', (e) => {
    var isBuilding = $('#buildingEnable').prop('checked');
    backgroundPage.setBuildingStatus(isBuilding);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          op: (isBuilding ? 'enableBuilding' : 'disableBuilding')
        },
        (response) => {
        });
    });
  });

  var isConfirming = backgroundPage.getConfirmingStatus();
  $('#confirmingEnable').prop('checked', isConfirming);
  $('#confirmingEnable').on('change', (e) => {
    var isConfirming = $('#confirmingEnable').prop('checked');
    backgroundPage.setConfirmingStatus(isConfirming);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          op: (isConfirming ? 'enableConfirming' : 'disableConfirming')
        },
        (response) => {
        });
    });
  });

  var isDummyAd = backgroundPage.getDummyAdStatus();
  $('#dummyAdEnable').prop('checked', isDummyAd);
  $('#dummyAdEnable').on('change', (e) => {
    var isDummyAd = $('#dummyAdEnable').prop('checked');
    backgroundPage.setDummyAdStatus(isDummyAd);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          op: (isDummyAd ? 'enableDummyAd' : 'disableDummyAd')
        },
        (response) => {
        });
    });
  });

  var isNativeAdCtrl = backgroundPage.getNativeAdCtrlStatus();
  $('#nativeAdCtrlEnable').prop('checked', isNativeAdCtrl);
  $('#nativeAdCtrlEnable').on('change', (e) => {
    var isNativeAdCtrl = $('#nativeAdCtrlEnable').prop('checked');
    backgroundPage.setNativeAdCtrlStatus(isNativeAdCtrl);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          op: (isNativeAdCtrl ? 'enableNativeAdCtrl' : 'disableNativeAdCtrl')
        },
        (response) => {
        });
    });
  });

  var isDebug = backgroundPage.getDebugStatus();
  $('#debugEnable').prop('checked', isDebug);
  $('#debugEnable').on('change', (e) => {
    var isDebug = $('#debugEnable').prop('checked');
    backgroundPage.setDebugStatus(isDebug);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          op: (isDebug ? 'enableDebug' : 'disableDebug')
        },
        (response) => {
        });
    });
  });

  var isDraft = backgroundPage.getDraftStatus();
  $('#draftEnable').prop('checked', isDraft);
  $('#draftEnable').on('change', (e) => {
    var isDraft = $('#draftEnable').prop('checked');
    backgroundPage.setDraftStatus(isDraft);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          op: (isDraft ? 'enableDraft' : 'disableDraft')
        },
        (response) => {
        });
    });
  });
});
