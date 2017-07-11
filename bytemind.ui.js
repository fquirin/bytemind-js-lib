//UI
function bytemind_build_ui(){
	var UI = {};
	UI.version = "0.3.3";
	
	//client info
	UI.isCordova = ('cordova' in window);
	UI.isTouchDevice = false;
	UI.isAndroid = false;
	UI.isIOS = false;
	UI.isMobile = false;
	UI.isStandaloneWebApp = false;
	UI.isChromeDesktop = false;
	UI.isSafari = false;
	UI.isEdge = false;
	
	//setup UI components and client variables
	UI.setup = function(){
		//is touch device?
		if ("ontouchstart" in document.documentElement){
			UI.isTouchDevice = true;
			document.documentElement.className += " bytemind-touch-device";
		}
		//is Android or Chrome?
		UI.isAndroid = (UI.isCordova)? (device.platform === "Android") : (navigator.userAgent.match(/(Android)/ig)? true : false);
		UI.isChrome = (/Chrome/gi.test(navigator.userAgent)) && !(/Edge/gi.test(navigator.userAgent));
		//is iOS or Safari?
		UI.isIOS = (UI.isCordova)? (device.platform === "iOS") : (/iPad|iPhone|iPod/g.test(navigator.userAgent) && !window.MSStream);
		UI.isSafari = /Safari/g.test(navigator.userAgent) && !UI.isAndroid && !UI.isChrome; //exclude iOS chrome (not recommended since its still appleWebKit): && !navigator.userAgent.match('CriOS');
		//is Chrome Desktop?
		if (UI.isChrome && !UI.isAndroid){
			UI.isChromeDesktop = true;
		}
		//is Edge?
		UI.isEdge = (/Edge/gi.test(navigator.userAgent));
		//is mobile?
		UI.isMobile = !UI.isEdge && !UI.isChromeDesktop && (UI.isAndroid || UI.isIOS);
		//is standalone app?
		UI.isStandaloneWebApp = isStandaloneWebApp();
		function isStandaloneWebApp(){
			if (UI.isCordova){
				isStandalone = true;
			}else{
				var urlParam = ByteMind.page.getURLParameter("isApp");
				if (urlParam && urlParam == "true"){
					urlParam = true;
				}
				var google = window.matchMedia('(display-mode: standalone)').matches;
				var apple = window.navigator.standalone;
				var isStandalone = (urlParam || google || apple);
			}
			if (isStandalone){
				document.documentElement.className += " bytemind-standalone-app";
			}
			return isStandalone;
		}
		
		//set client
		ByteMind.config.clientInfo = (((UI.isIOS)? 'iOS_' : '') 
							+ ((UI.isAndroid)? 'android_' : '') 
							+ ((UI.isChromeDesktop)? 'chrome_' : '')
							+ ((UI.isSafari)? 'safari_' : '')
							+ ((UI.isEdge)? 'edge_' : '')
							+ ((UI.isStandaloneWebApp)? "app_" : "browser_") + ("v" + UI.version));
	}
	
	//make auto-resize swipe bar
	UI.makeAutoResizeSwipeArea = function(selector){
		var $swipeArea = $(selector);
		$swipeArea.mouseup(function() {				$(this).removeClass('bytemind-swipe-active');
			}).mousedown(function() {				$(this).addClass('bytemind-swipe-active');
			}).on('touchstart', function(event){	$(this).addClass('bytemind-swipe-active');
			}).on('touchend', function(event){		$(this).removeClass('bytemind-swipe-active');
			});
		return $swipeArea[0];
	}
	
	return UI;
}