var x = 0;
var y = 0;

window.onmousedown = function(e){
	var bubble = document.getElementById("rightclick_bubble");
	if (bubble != null && e.target != bubble && e.target.parentNode != bubble) {
		removeBubble();
	}
};

window.oncontextmenu = function(e) {
	x = e.pageX;
	y = e.pageY;
};

chrome.extension.onMessage.addListener(function(request) {
	if (request.action == "createBubble") { createBubble(request.text); }
	if (request.action == "removeBubble") { removeBubble(); }
});

function createBubble(sourceText) {
	var bubble = document.createElement("div");
	bubble.id = "rightclick_bubble";
	bubble.style.left = x + "px";
	bubble.style.top = y + "px";
	bubble.innerHTML = '<span class="info">' + "Downloading...." + '</span>';
	document.body.appendChild(bubble);
	
	var wait_create = setTimeout(function () { 
		bubble.className = "popup"; 
		clearTimeout(wait_create);		
	}, 10);
}

function removeBubble() {
	var bubble = document.getElementById("rightclick_bubble");
	if(bubble) {
		bubble.removeAttribute("class");
		var wait_delete = setTimeout(function () {
			document.body.removeChild(bubble);
			clearTimeout(wait_delete);
		}, 310);
	}
}