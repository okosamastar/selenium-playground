function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const TOUCAN_MARKETING_USER_GROUP = {
	SHOW_TOUCAN: 'SHOW_TOUCAN',
	SHOW_NEXT_AD_PROVIDER: 'SHOW_NEXT_AD_PROVIDER'
};

var GLOBAL_STORAGE_TOUCAN_MARKETING_USER_GROUP_KEY = getParameterByName('GLOBAL_STORAGE_TOUCAN_MARKETING_USER_GROUP_KEY');
var iframeMessagePrefix = getParameterByName('iframeMessagePrefix');
var configurationUrl = getParameterByName('configurationUrl');
var marketingUserGroup = getParameterByName('marketingUserGroup');
var adLinkUrl = getParameterByName('adLinkUrl');
var configuration = undefined;

window.PP_postMessage = function(type, value) {
	parent.postMessage({ [iframeMessagePrefix + type]: value }, "*");
};

function linkClick() {
	window.PP_postMessage("action", { url: adLinkUrl });
	return false;
}

function generateMarketingUserGroupByConfiguration() {
	/*
	{
		enabled: true,
		percentOfUsersToShow: 50,
	}
	 */
	const percentOfUsersToShow = configuration.percentOfUsersToShow;
	const randomNum = Math.floor(Math.random() * 101); // from 0 to 100

	if (!percentOfUsersToShow || randomNum > percentOfUsersToShow) {
		marketingUserGroup = TOUCAN_MARKETING_USER_GROUP.SHOW_NEXT_AD_PROVIDER;
	} else {
		marketingUserGroup = TOUCAN_MARKETING_USER_GROUP.SHOW_TOUCAN;
	}
	window.PP_postMessage("set_global_storage_element", { key: GLOBAL_STORAGE_TOUCAN_MARKETING_USER_GROUP_KEY, value: marketingUserGroup });
}

function showAdOrSkipByMarketingUserGroup() {
	if (marketingUserGroup === TOUCAN_MARKETING_USER_GROUP.SHOW_TOUCAN) {
		const linkElements = document.getElementsByTagName('a');
		for (let i = 0; i < linkElements.length; i++) {
			linkElements[i].addEventListener('click', linkClick);
		}

		document.getElementById('carbonads').style.display = 'block';
		window.PP_postMessage("ad_loaded", { url: adLinkUrl });
	} else {
		window.PP_postMessage("next_ad_provider", true);
	}
}

window.onload = function() {
	var script = document.createElement('script');
	script.id = '_toucan_configuration_js';
	script.type = 'text/javascript';
	script.src = configurationUrl;
	script.onerror = function () {
		window.PP_postMessage("next_ad_provider", true);
	};
	script.onload = function () {
		const enabled = configuration.enabled;
		if (!enabled) {
			window.PP_postMessage("next_ad_provider", true);
			return;
		}
		if (!marketingUserGroup || !TOUCAN_MARKETING_USER_GROUP[marketingUserGroup]) {
			generateMarketingUserGroupByConfiguration();
		}
		showAdOrSkipByMarketingUserGroup();
	}
	document.body.appendChild(script);
}
