var getMicFrame=null,audioStream=null,cameraStream=null,videoStream=null,tempVideo=null,MIME_TYPE="video/webm",file_name="/awesome/record.webm",chooseDesktopMediaId=null,currentId=null,tempFileInfo=null,currentSize=null,currentName=null,currentSaveName=null,fileCreated=!1,currentInfo=null,isAnnotated=!1,twoHoursCount=1,isRecording=!1,recordingStatus="",isRecordingPaused=!1,recordingTime=0,recordingTimer=null,lastPausingTime=null,pausedTime=null,recoder=null,currentRecordType="",tabSoundAudioPlayer=null,isPremium=!1,recordingStartTime=null,count=0,_cd=0,isInCountdown=!1,cameraPreviewOpened=!1,socketClients=[],socketClient=null,countDownInterval=null;function resetData(){dataArray=new ArrayBuffer(0),audioArray=new ArrayBuffer(0)}function getPremium(){return new Promise((function(e,t){chrome.cookies.get({url:"https://www.awesomescreenshot.com",name:"screenshot_personal_type"},(function(t){t&&"1"==t.value?e(!0):e(!1)}))}))}function getPremiumLevel(){return new Promise((function(e,t){chrome.cookies.get({url:"https://www.awesomescreenshot.com",name:"screenshot_personal_premium_level"},(function(t){t&&parseInt(t.value)>1?e(!0):e(!1)}))}))}function getSaveName(){if("desktop"===currentRecordType)var e="Desktop";else if("tab"===currentRecordType)e="Tab";else if("camera"===currentRecordType)e="Camera";return e+"-"+(new Date).getTime()}function getFormatName(){if("desktop"===currentRecordType||"tab"===currentRecordType)return currentRecordingTabTitle;if("camera"===currentRecordType){var e=new Date;return"Camera-"+(e.getFullYear()+"-"+(e.getMonth()+1)+"-"+e.getDate()+"-"+e.getHours()+"-"+e.getMinutes()+"-"+e.getSeconds())}}var baseUrl="https://www.awesomescreenshot.com";function refreshCookie(){$.get(baseUrl+"/promotion_ex")}function goToUpgrade(e){var t="https://www.awesomescreenshot.com";chrome.cookies.get({url:t,name:"screenshot_personal_type"},(function(o){if(o){var r="/pricing?from="+e;openNewTab(t+r)}else{r=t+"/user/login?redirect="+t+("/pricing?from="+e);openNewTab(r)}}))}function getMicStream(e){return new Promise((function(t,o){window.navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e}}}).then((function(e){t(e)})).catch((function(e){o("[Mic] "+e)}))}))}function getVideoStream(e,t,o,r){if("1080"===localStorage.max_resolution)var n=1920,a=1080;else if("720"===localStorage.max_resolution)n=1280,a=720;else n=3840,a=2160;return new Promise((function(i,c){if("tab"==e)chrome.tabCapture.capture({audio:t,video:!0,videoConstraints:{mandatory:{chromeMediaSource:"tab",maxWidth:n,maxHeight:a}}},(function(e){if(e)i(e);else{var t=chrome.runtime.lastError.message;alert("Get tab stream error, please refresh the page and try again.",t)}}));else if("desktop"==e){var d=["screen","audio"];r||d.push("window"),chooseDesktopMediaId&&(chrome.desktopCapture.cancelChooseDesktopMedia(chooseDesktopMediaId),chooseDesktopMediaId=null),chooseDesktopMediaId=chrome.desktopCapture.chooseDesktopMedia(d,(function(e){if(e){var t={audio:{mandatory:{chromeMediaSource:"desktop",chromeMediaSourceId:e}},video:{mandatory:{chromeMediaSource:"desktop",chromeMediaSourceId:e,maxWidth:n,maxHeight:a,maxFrameRate:30}},optional:[]};window.navigator.mediaDevices.getUserMedia(t).then(i).catch(c)}else stopCamera(),stopToolbar(),audioStream&&audioStream.stop()}))}else"camera"==e&&getCameraStream(o,(function(e){cameraStream=e,chrome.windows.create({url:"/camera.html?type=camera",type:"popup",width:960,height:590}),i(e)}),(function(e){c(e)}))}))}function setBadge(e,t){"text"===e?chrome.browserAction.setBadgeText({text:t}):"color"===e&&chrome.browserAction.setBadgeBackgroundColor({color:t})}function doBeginRecord(e,t){setBadge("color","red"),e.countdown>0?currentRecordingTabId?insertContentScript(currentRecordingTabId).then((function(){sendMessageToTab(currentRecordingTabId,{action:"startCountDown",countdown:parseInt(e.countdown)}),isInCountdown=!0,setBadge("text",_cd+""),countDownInterval=setInterval((function(){if(1==_cd)return clearInterval(countDownInterval),setBadge("text",""),_cd=0,void setTimeout((function(){gotStream(t,e)}),500);setBadge("text",--_cd+"")}),1e3)}),(function(){isInCountdown=!0,setBadge("text",_cd+""),countDownInterval=setInterval((function(){if(1==_cd)return clearInterval(countDownInterval),setBadge("text",""),_cd=0,void setTimeout((function(){gotStream(t,e)}),100);setBadge("text",--_cd+"")}),1e3)})).catch((function(e){})):(isInCountdown=!0,setBadge("text",_cd+""),countDownInterval=setInterval((function(){if(1==_cd)return clearInterval(countDownInterval),setBadge("text",""),_cd=0,void setTimeout((function(){gotStream(t,e)}),300);setBadge("text",--_cd+"")}),1e3)):gotStream(t,e)}function getStream(e){return e.isRecordMic?getMicStream(e.micDeviceId).then((function(t){return audioStream=t,getVideoStream(e.recordType,e.isRecordTabSound,e.camDeviceId,e.removeAppWin)})):getVideoStream(e.recordType,e.isRecordTabSound,e.camDeviceId,e.removeAppWin)}function beginRecord(e){currentRecordType=e.recordType,getCurrentTab((function(e){currentRecordingTabTitle=e.title,currentRecordingTabUrl=e.url})),_cd=parseInt(e.countdown),getStream(e).then((function(t){if((videoStream=t).getVideoTracks()[0].onended=function(){if(audioStream&&audioStream.stop(),cameraStream&&cameraStream.stop(),socketClient){socketClient.cancel(),socketClient.needReconnect=!1,socketClient.sentQueue=[],socketClient.willSendQueue=[],socketClient.close(1e3)}currentRecordingTabId&&sendMessageToTab(currentRecordingTabId,{action:"stop-countdown"}),setDefaults()},recordingStatus="preparing","local"===e.saveLocation?doBeginRecord(e,videoStream):(initVideo({onopen:function(){doBeginRecord(e,videoStream)},onError:function(){},onClose:function(){}}),sendMessage({action:"prepare-recording"})),"tab"===e.recordType&&e.isRecordTabSound){tabSoundAudioPlayer=new Audio;try{tabSoundAudioPlayer.srcObject=videoStream}catch(e){tabSoundAudioPlayer.src=window.URL.createObjectURL(videoStream)}tabSoundAudioPlayer.volume=1,tabSoundAudioPlayer.play()}})).catch((function(e){var t="",o="";if(/Permission denied by system/.test(e)?(t="mac",/\[Mic\]/.test(e)?o="mic":"camera"===currentRecordType&&(o="camera")):/Could not start audio source/.test(e)&&(t="win",o="mic"),t){var r="/permission-denied.html?os="+t;o&&(r+="&type="+o),chrome.tabs.create({url:r})}}))}function handleBlob(e){if("local"===localStorage["save-location"]){if(count++,e)if(fileCreated){fileSaver.append(e,currentSaveName),currentSize+=e.size;var t=bytesToSize(currentSize);currentInfo.detail.size=t,currentInfo.detail.duration=recordingTime,DB.update(currentId,currentInfo)}else currentName=getFormatName(),currentSaveName=getSaveName(),fileSaver.save(e,currentSaveName).then((function(t){fileCreated=!0,currentSize=e.size,tempFileInfo={fileUrl:t,title:currentName,size:bytesToSize(currentSize),duration:recordingTime,recordType:currentRecordType},DB.save(tempFileInfo).then((function(e){currentId=e.id,currentInfo=e}))}))}else socketClient.send(e)}function getBitRate(e,t){return Math.floor(e*t*2)}function gotStream(e,t){if(e&&e.active){var o={type:"video",disableLogs:!1,getNativeBlob:!0,timeSlice:"local"===localStorage["save-location"]?3e3:500,ondataavailable:handleBlob};if(!o.videoCodec)var r="vp8";if(r&&(o.mimeType="video/webm; codecs="+r.toLowerCase()),audioStream){var n=new MediaStream;getMixedAudioStream([audioStream,e]).getAudioTracks().forEach((function(e){n.addTrack(e)})),e.getVideoTracks().forEach((function(e){n.addTrack(e)})),e=n}recorder=new RecordRTC(e,o);try{recorder.startRecording(),sendMessage({action:"start-recording"}),alreadyHadGUMError=!1}catch(e){}isRecording=!0,recordingStatus="recording",videoStream.onended=function(e,t){videoStream&&(videoStream.onended=function(){}),audioStream&&audioStream.stop(),cameraStream&&cameraStream.stop(),stopScreenRecording(e,t)},videoStream.getVideoTracks()[0].onended=function(){videoStream&&videoStream.onended&&videoStream.onended()},recordingStartTime=(new Date).getTime(),recordingTimer=setInterval(updateRecordingTime,100)}}function checkTimeLength(e){"cloud"===localStorage["save-location"]&&getPremiumLevel().then((function(t){t||e>=108e5*twoHoursCount&&e<=108e5*twoHoursCount+100&&(chrome.windows.create({type:"popup",url:"/notification.html",left:0,top:0,width:300,height:400,focused:!0}),twoHoursCount++)})),e>=301e3&&chrome.storage.local.get("userinfo",(function(e){e.userinfo?"local"===localStorage["save-location"]?e.userinfo.premiumLevel<2&&(1===e.userinfo.premiumLevel&&0===e.userinfo.newPremium||stopStream(!1,!0)):e.userinfo.totalVideoCount>=20&&e.userinfo.premiumLevel<2&&stopStream(!1,!0):stopStream(!1,!0)}))}function getMixedAudioStream(e){var t=new AudioContext,o=[],r=t.createGain();r.connect(t.destination),r.gain.value=0;var n=0;if(e.forEach((function(e){if(e.getAudioTracks().length){n++;var a=t.createMediaStreamSource(e);a.connect(r),o.push(a)}})),n){var a=t.createMediaStreamDestination();return o.forEach((function(e){e.connect(a)})),a.stream}}function updateRecordingTime(){if(!isRecordingPaused){var e=(new Date).getTime()-recordingStartTime;pausedTime&&(e-=pausedTime),checkTimeLength(e),setBadge("text",recordingTime=secondsToTime(e))}}function secondsToTime(e){e=Math.floor(e/1e3);var t=Math.floor(e/3600),o=e%60;return o<10&&(o="0"+o),(t>0?t+":":"")+Math.floor((e-3600*t)/60)+":"+o}function setDefaults(){currentRecordingTabId&&sendMessageToTab(currentRecordingTabId,{action:"removeRecordDiv"}),videoStream&&(videoStream.getTracks().forEach((function(e){e.stop()})),videoStream.onended&&videoStream.onended()),isShowToolbar&&(resetToolbarSettings(),stopToolbar()),tabSoundAudioPlayer=null,audioStream&&audioStream.stop(),cameraStream&&stopCamera(),countDownInterval&&(clearInterval(countDownInterval),countDownInterval=null),recorder=null,videoStream=null,isRecording=!1,recordingStatus="",recordingStartTime=null,recordingTime=0,tempFileInfo=null,imgIndex=0,isRecordingPaused=!1,isAnnotated=!1,cameraPreviewOpened=!1,_cd=0,isInCountdown=!1,currentId=null,tempFileInfo=null,currentSize=null,currentName=null,currentSaveName=null,fileCreated=!1,currentInfo=null,twoHoursCount=1,isEmbedCamera=!1,isShowToolbar=!1,clearInterval(recordingTimer),recordingTimer=null,lastPausingTime=null,pausedTime=null,currentRecordingTabId="",currentRecordingTabTitle="",tabCameraClosedManually=!1,setBadge("text","")}function pauseScreenRecording(e){isRecordingPaused||("local"!==localStorage["save-location"]&&socketClient.pause(e),recorder.pauseRecording(),isShowToolbar&&("tab"===recordType?sendMessageToTab(currentRecordingTabId,{action:"pause"}):"desktop"===recordType&&broadCast({action:"pause"})),"camera"===recordType&&sendMessage({action:"pause-recording"}),isRecordingPaused=!0,lastPausingTime=(new Date).getTime())}function resumeScreenRecording(){"local"!==localStorage["save-location"]&&"connected"!==socketClient.status?socketClient.reConnect():(recorder.resumeRecording(),isShowToolbar&&("tab"===recordType?sendMessageToTab(currentRecordingTabId,{action:"resume"}):"desktop"===recordType&&broadCast({action:"resume"})),"camera"===recordType&&sendMessage({action:"resume-recording"}),isRecordingPaused=!1,pausedTime=pausedTime+(new Date).getTime()-lastPausingTime)}function stopStream(e,t){videoStream&&videoStream.onended(e,t)}function restoreRecording(){isRecording=!1,recordingStatus="",clearInterval(recordingTimer),recordingTimer=null,lastPausingTime=null,pausedTime=null,currentRecordingTabId="",tabCameraClosedManually=!1,setBadge("text",""),videoStream&&videoStream.getTracks().forEach((function(e){e.stop()}))}function stopScreenRecording(e,t){recorder.stopRecording((function(){if(googleEvent("record video","record video"),cameraStream&&stopCamera(),"local"===localStorage["save-location"])e?DB.delete(currentId):openNewTab("/video-react.html?id="+currentId);else{if(e){var o=socketClient.videoName.match(/-(.*)\.webm/)[1];socketClient.needReconnect=!1,socketClient.sentQueue=[],socketClient.willSendQueue=[],socketClient.close(1e3),$.ajax({method:"POST",url:"https://www.awesomescreenshot.com/api/v1/video/delete_video",data:JSON.stringify({videoID:o})})}else if(socketClient.complete(),openNewTab(socketClient.videoURI+(t?"?limit=true":"")),socketClient.videoName){o=socketClient.videoName.match(/-(.*)\.webm/)[1];SocketClient.httpClickStop(o)}}setDefaults(),sendMessage({action:"stop-recording"}),refreshUserInfo()})),recordingTimer&&clearTimeout(recordingTimer)}function stopToolbar(){"desktop"===recordType?chrome.tabs.query({},(function(e){e.forEach((function(e){sendMessageToTab(e.id,{action:"remove-toolbar"})}))})):"tab"===recordType&&currentRecordingTabId&&sendMessageToTab(currentRecordingTabId,{action:"remove-toolbar"}),isShowToolbar=!1}function getFileSize(e){var t=(e/1024).toFixed(2);return t=t<1024?t.toString().replace(",",".").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g,"$&,")+" KB":(t=(t/1024).toFixed(2)).toString().replace(",",".").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g,"$&,")+" MB"}function saveVideo(){var e="AwesomeScreenshot-"+(new Date).toLocaleString().replace(/\s/g,""),t=(new File([recorder.getBlob()],e+".webm",{type:"video/webm"}),recorder.getBlob()),o=bytesToSize(t.size);fileSaver.save(t,e+".webm").then((function(t){DB.save({fileUrl:t,title:e,size:o,duration:recordingTime}).then((function(e){chrome.runtime.sendMessage({name:"stop"},(function(){chrome.tabs.create({url:"/video.html?id="+e}),setDefaults()}))}))}))}function googleEvent(e,t){"undefined"!=typeof ga&&ga("send","event",getClientStr().toLowerCase(),e,t)}function getOS(){window.navigator.userAgent;var e=window.navigator.platform,t=null;return-1!==["Macintosh","MacIntel","MacPPC","Mac68K"].indexOf(e)?t="Mac OS":-1!==["Win32","Win64","Windows","WinCE"].indexOf(e)?t="Windows":!t&&/Linux/.test(e)&&(t="Linux"),t}function waitForCameraPreview(e){cameraPreviewOpened&&e();var t=setInterval((function(){cameraPreviewOpened&&(clearInterval(t),e())}),1e3)}chrome.cookies.get({url:baseUrl,name:"screenshot_personal_type"},(function(e){void 0===e&&refreshCookie()})),$(document).ready((function(){})),DB.init(),window.addEventListener("message",(function(e){"audioStream"==e.data.type&&(audioStream=e.data.steam)}),!1),chrome.commands.onCommand.addListener((function(e){"stop-recording"===e?stopStream():"pause-or-resume-recording"===e&&(isRecordingPaused?resumeScreenRecording():pauseScreenRecording())}));