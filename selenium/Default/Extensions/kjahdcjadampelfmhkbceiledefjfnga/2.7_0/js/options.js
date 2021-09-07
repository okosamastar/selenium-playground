function ClickBtn(){
	console.log("ClickBtn()");
	var tmpBtn = document.getElementById('OkBtn');
	tmpBtn.onclick = function (){window.close();};
}

function ConfigPageLinkFunc(){
	var tmpUrl = localStorage.url;
	tmpUrl = tmpUrl.substr(0, tmpUrl.lastIndexOf(':'));
	//console.log(tmpUrl);
	document.getElementById('ConfigPageLink').href = tmpUrl + "/APP_Installation.asp";
	//hiddentext.href.link = tmpUrl;	
}
function GetUrl(){
	var locate = location.search;
	if(locate.indexOf("=") > 0){		
		var hiddentext = document.getElementById('hidden_txet');
		hiddentext.style.display = "block";
	}	
}

function Optionsload() {
	if(localStorage.url) {
		var FullURL = localStorage.url;
		var tmpAddress = FullURL.substr(FullURL.lastIndexOf('//')+2, FullURL.lastIndexOf(':')-FullURL.indexOf('//')-2);
		var tmpPort = FullURL.substr(FullURL.lastIndexOf(':')+1, FullURL.lastIndexOf('/')-FullURL.lastIndexOf(':')-1);
		
		//if(document.getElementById('rdLocal').checked)
		//	document.getElementById('url').value = tmpAddress;
		//else
		//{
		//	if(tmpAddress.indexOf("asuscomm"))
		//}
		
		if(isNaN(parseInt(tmpAddress, 10))) {	//false: num
			document.getElementById("rdremote").checked = true;
			document.getElementById('rdLocal').checked = false;
			if(tmpAddress.indexOf("asuscomm")>=0) {
				document.getElementById('rdasusDDNS').checked = true;
				document.getElementById('rdothersDDNS').checked = false;
				var DDNS= tmpAddress.substr(0, tmpAddress.indexOf('.'));
				document.getElementById('asusDDNSurl').value = DDNS;
				document.getElementById('othersDDNSurl').value = "";
			} else {
				document.getElementById('rdasusDDNS').checked = false;
				document.getElementById('rdothersDDNS').checked = true;				
				document.getElementById('asusDDNSurl').value = "";
				document.getElementById('othersDDNSurl').value = tmpAddress;
			}
		} else {
			document.getElementById("rdremote").checked = false;
			document.getElementById('rdLocal').checked = true;
			document.getElementById('url').value = tmpAddress;
		}
		document.getElementById('port').value = tmpPort;
		document.getElementById('username').value = localStorage.username;
		document.getElementById('password').value = localStorage.password;
	} else {
		loadDefaults();
		Optionsstore();
	}
}

function Optionsstore() {
	var tmpAddress = undefined;
	var tmpPort = undefined;
	var tmpURL = undefined;

	if(document.getElementById('rdLocal').checked) {
		tmpAddress = document.getElementById('url').value;
	} else {
		if(document.getElementById('rdasusDDNS').checked) {
			tmpAddress = document.getElementById('asusDDNSurl').value + ".asuscomm.com";
		} else {
			tmpAddress = document.getElementById('othersDDNSurl').value;
		}
	}

	tmpPort = document.getElementById('port').value;
	tmpURL = "http://" + tmpAddress + ":" + tmpPort + "/downloadmaster";
	localStorage.url = tmpURL;	
	localStorage.username = document.getElementById('username').value;
	localStorage.password = document.getElementById('password').value;
}

function loadDefaults() {
	//document.getElementById('url').value = 'http://192.168.1.1:8081/downloadmaster';

	document.getElementById('rdLocal').checked = true;
	document.getElementById("rdremote").checked = false;
			
	document.getElementById('url').value = '192.168.1.1';
	document.getElementById('port').value = '8081';
	document.getElementById('username').value = 'admin';
	document.getElementById('password').value = 'admin';
}


window.onload = function() {

	Optionsload();	

	document.getElementById('url').onchange = Optionsstore;
	document.getElementById('url').onkeyup = Optionsstore;
	document.getElementById('asusDDNSurl').onchange = Optionsstore;
	document.getElementById('asusDDNSurl').onkeyup = Optionsstore;
	document.getElementById('othersDDNSurl').onchange = Optionsstore;
	document.getElementById('othersDDNSurl').onkeyup = Optionsstore;
	document.getElementById('port').onchange = Optionsstore;
	document.getElementById('port').onkeyup = Optionsstore;
	document.getElementById('username').onchange = Optionsstore;
	document.getElementById('username').onkeyup = Optionsstore;
	document.getElementById('password').onchange = Optionsstore;
	document.getElementById('password').onkeyup = Optionsstore;
	
	GetUrl();
	ConfigPageLinkFunc();
	ClickBtn();
}
