var firebase,firedata,config={apiKey:"AIzaSyBDmZsXrDi6xnUeu_fXmoHh0StKjYCthvk",authDomain:"uxunicorns-fca1e.firebaseapp.com",databaseURL:"https://uxunicorns-fca1e.firebaseio.com",projectId:"uxunicorns-fca1e",storageBucket:"gs://uxunicorns-fca1e.appspot.com",messageingSenderId:"752488928557"};firebase&&firebase.initializeApp(config);var user,interval,db=firebase.database();function handleContextMenu(e,o){"contact_team"==e.menuItemId&&chrome.tabs.create({url:"mailto:ask@productdesign.tips"})}function get_array_value_from_storage(e,o){chrome.storage.local.get(null,function(t){var a,s=[];for(count=t[e+"_count"],void 0===count&&(count=0),a=0;a<count;a++){var r=e+"_"+a;s.push(t[r])}o(s)})}function set_array_value_to_storage(e,o){var t;"uxunicorns_posts"==e?t={uxunicorns_posts_count:o.length}:"uxunicorns_category"==e&&(t={uxunicorns_category_count:o.length}),chrome.storage.local.set(t,function(){for(var t={},a=0;a<o.length;a++){t[e+"_"+a]=o[a]}chrome.storage.local.set(t)})}function counterChange(e,o){let t,a=0,s=[],r={};for(var n=0;n<e.length;n++)s[n]=e[n].title;return o.forEach(e=>{~s.indexOf(e.title)||(a++,t="#"+e.category_id,r[t]?r[t]+=1:r[t]=1)}),console.log(r),chrome.storage.local.get(["uxuicorn_first_time"],e=>{e.uxuicorn_first_time||48==Object.keys(r).length||newArticlesCounter(r)}),a}function newArticlesCounter(e){chrome.storage.local.get(["newArticlesCounter"],o=>{let t=o.newArticlesCounter;for(var a in e)t[a]?t[a]+=e[a]:t[a]=e[a];chrome.storage.local.set({newArticlesCounter:t})})}function updatedata(){console.log("Hi, it`s me, your update function :P");let e=new Date,o=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1,9);console.log("current update: "+e),console.log("next update: "+o),chrome.storage.local.set({nextUpdate:o.getTime()});var t=[],a=[];firedata||(firedata=firebase.database()),firedata.ref("/category_web").once("value").then(function(e){e.exists()?(e.forEach(function(e){t.push(e.val())}),firedata.ref("/posts_recent").once("value").then(function(e){e.exists()?(e.forEach(function(e){a.push(e.val())}),get_array_value_from_storage("uxunicorns_category",function(e){old_category=e,get_array_value_from_storage("uxunicorns_posts",function(e){var o;(o=counterChange(e,a))>0&&(set_array_value_to_storage("uxunicorns_category",t),set_array_value_to_storage("uxunicorns_posts",a),chrome.browserAction.setBadgeText({text:o>9?"9+":""+o}),chrome.storage.local.set({random_category:!1}))})})):console.log("no posts recived from Firebase")})):console.log("no categories recived from Firebase")}),firebase.database().ref("/column_templates").once("value",function(e){if(e.exists()){let o={};e.forEach(function(e){let t={},a=decodeURIComponent(e.key).replace(/\%2E/g,".");e.forEach(function(e){let o=decodeURIComponent(e.key).replace(/\%2E/g,".");t[o]=e.val()}),o[a]=t}),chrome.storage.local.set({templates:o})}else chrome.storage.local.set({templates:{}})}),firebase.database().ref("/column_templates_descriptions").once("value",function(e){if(e.exists()){let o={};e.forEach(function(e){o[decodeURIComponent(e.key).replace(/\%2E/g,".")]=e.val()}),chrome.storage.local.set({templatesDescriptions:o})}else chrome.storage.local.set({templatesDescriptions:{}})}),firebase.database().ref("/workspace_templates").once("value",function(e){if(e.exists()){let o={};e.forEach(function(e){if("Design%20Links"==e.key){let t=decodeURIComponent(e.key).replace(/\%2E/g,".");o[t]=e.val()}}),chrome.storage.local.set({workspaceTemplates:o})}else chrome.storage.local.set({workspaceTemplates:{}})}),firebase.database().ref("/column_templates_images").once("value",function(e){e.exists()?chrome.storage.local.get(["images"],o=>{let t=[],a=[],s=length=0,r=e.val();for(key in r)length++;for(image in r){let e=image,n=new Image;n.src=r[image],n.onload=(()=>{t.push([e]),a.push(getBase64Image(n)),++s==length&&(t.forEach((e,t)=>{o.images[e]=a[t]}),chrome.storage.local.set({images:o.images,templateImages:r}))}),n.onerror=(()=>{n.src="/img/image_not_found.svg",n.onload=(()=>{t.push([e]),a.push(getBase64Image(n)),++s==length&&(t.forEach((e,t)=>{o.images[e]=a[t]}),chrome.storage.local.set({images:o.images,templateImages:r}))})})}}):console.log("No images for templates received from Firebase")}),firebase.database().ref("/challenge_templates").once("value",function(e){if(e.exists()){let o={};e.forEach(function(e){o[decodeURIComponent(e.key).replace(/\%2E/g,".")]=e.val()}),chrome.storage.local.set({challenges:o})}else chrome.storage.local.set({challenges:{}})}),firebase.database().ref("/extension_messages").once("value",e=>{e.exists()?e.forEach(e=>{if(e.val().display){let o={};o.message=e.val().message,o.display=!0,chrome.storage.local.get(["extension_message"],e=>{e.extension_message?o.message!=e.extension_message.message&&chrome.storage.local.set({extension_message:o}):chrome.storage.local.set({extension_message:o})})}}):console.log("No extension messages received from Firebase")}),firebase.database().ref("extension_publish_example").once("value",e=>{e.exists()?chrome.storage.local.set({extensionPublishExample:e.val()}):chrome.storage.local.set({extensionPublishExample:"https://productdesign.tips/"})})}function getBase64Image(e){const o=document.createElement("canvas");return o.width=e.width,o.height=e.height,o.getContext("2d").drawImage(e,0,0),o.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/,"")}chrome.contextMenus.onClicked.addListener(handleContextMenu),chrome.runtime.onInstalled.addListener(function(e){chrome.storage.local.clear(),chrome.storage.local.set({uxuicorn_show_type:"tab",uxuicorn_first_time:!0},function(){firedata=firebase.database(),updatedata();var e=chrome.runtime.lastError;e&&alert(e)}),chrome.storage.local.set({functionalMode:"articles"}),chrome.storage.local.set({viewMode:"less"}),chrome.storage.local.set({colorInspiration:!1}),chrome.storage.local.set({autoDarkMode:"enabled"}),chrome.browserAction.setBadgeBackgroundColor({color:"#E52034"}),chrome.storage.local.set({images:{}}),chrome.storage.local.get(["bookmarks"],e=>{db.ref("/workspace_templates/Design%20Links").once("value",e=>{let o=(new Date).getTime(),t=e.val();chrome.storage.local.set({workspaces:[{bookmarks:t.bookmarks,bookmarksListCount:t.bookmarksListCount,id:"workspaces_list_"+o,title:decodeURIComponent(e.key).replace(/\%2E/g,".")}]}),chrome.storage.local.set({bookmarksListCount:t.bookmarksListCount}),chrome.storage.local.set({bookmarks:t.bookmarks}),chrome.storage.local.set({currentWorkspaceId:"workspaces_list_"+o})}),chrome.storage.local.set({workspacesCount:1}),chrome.storage.local.set({backupWorkspace:{}}),chrome.storage.local.set({newArticlesCounter:{}})}),chrome.contextMenus.create({title:"Contact support team",id:"contact_team",contexts:["browser_action"]})}),chrome.runtime.onInstalled.addListener(function(e){if("install"==e.reason){let e="https://docs.google.com/forms/d/e/1FAIpQLScFI30e4N7OxEU-vpcRf0El-hYbv7Y1vMRSob7jzZyquX5mdw/viewform";chrome.runtime.setUninstallURL&&chrome.runtime.setUninstallURL(e)}}),chrome.browserAction.onClicked.addListener(function(){chrome.tabs.create({url:"html/productdesigntips.html"})}),chrome.runtime.onMessage.addListener(async(e,o,t)=>{if("login"==e.userStatus)user=e.user,t("user login");else if("logout"==e.userStatus)user=null,t("user logout");else if("check"==e.userStatus)t(user?"user logged":"user not logged");else if(e.updateData)updatedata(),t("Congratulations, data updated");else if("create subscription"==e.paddle){let o={vendor_id:109620,vendor_auth_code:"5be428e1d4a5daf38ebb4b89fa78e7a48f5ebece917235034b",product_id:e.productId,customer_email:e.email,passthrough:e.uid};fetch("https://vendors.paddle.com/api/2.0/product/generate_pay_link",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}).then(e=>e.json()).then(e=>{console.log(e.response.url),chrome.storage.local.set({paddleSubscriptionLink:e.response.url})}).catch(e=>{console.log(e.message),chrome.storage.local.set({paddleSubscriptionLink:"Error: "+e.message})}),t("getting link from paddle")}});