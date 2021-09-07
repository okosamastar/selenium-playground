function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var iframeMessagePrefix = getParameterByName('iframeMessagePrefix');
var adScriptUrl = getParameterByName('adScriptUrl');

window.PP_postMessage = function(type, value) {
	parent.postMessage({ [iframeMessagePrefix + type]: value }, "*");
};
var mutationObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if (mutation.addedNodes) {
			for (var node of mutation.addedNodes) {
				if (node.id === 'carbonads') {
					var links = node.getElementsByTagName('a');
					if (links.length > 0) {
						var adHref = links[0].href;
						window.PP_postMessage("ad_loaded", { url: adHref });
						for(var i=0; i<links.length; i++) {
							links[i].onclick=function(e) {
								window.PP_postMessage("action", { url: this.href });
							};
						}
						mutationObserver.disconnect();
						break;
					}
				}
			}
		}
	});
});
mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
window.onload = function() {
	mutationObserver.disconnect();
}

var script = document.createElement('script');
script.id = '_carbonads_js';
script.type = 'text/javascript';
script.src = adScriptUrl;
script.onerror = function() { window.PP_postMessage("next_ad_provider", true); };
document.body.appendChild(script);