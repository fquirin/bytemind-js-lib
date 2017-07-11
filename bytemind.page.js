var ByteMind = new Object();

//default library stuff
ByteMind.debug = bytemind_build_debug();
ByteMind.page = bytemind_build_page();
ByteMind.config = bytemind_build_config();

//more plugins
ByteMind.buildPlugins = function(){
	ByteMind.ui = bytemind_build_ui();
	ByteMind.ui.Carousel = bytemind_build_ui_carousel();
	ByteMind.ui.SideMenu = bytemind_build_ui_sidemenu();
}

//---BUILD PAGE---

var HOME = "welcome";
var activeSection = "blank";
var sideMenu;
var useSideMenu = false;
var menuButtons;
var menuButtonsTotalWidth;

$(document).ready(function(){
	//load plugins
    ByteMind.buildPlugins();
	
	//setup page
	ByteMind.ui.setup();
	buildNavigation();
	
	//debug
	var clientInfo = document.createElement('span');
	clientInfo.innerHTML = ByteMind.config.clientInfo;
	$(clientInfo).css({position:'fixed', bottom:'0', right:'0'});
	$('body').append(clientInfo);
	
	//check page actions and register hashchange event listener
	if (!ByteMind.page.checkUrlForAction()){
		ByteMind.page.activateActionByName(HOME, { animate:false, replaceHistory:true});
	}
	window.onhashchange = function(){
		ByteMind.page.checkUrlForAction();
	};
});

function buildNavigation(){
	//Home
	registerSectionWithNavButton("Willkommen", {
		sectionName : HOME,
		title : "ByteMind",
		headerTitle : "Willkommen",
		description : "RESTful Web Services, Websites, Apps, Voice-Assistants and Data-Analytics."
	});
	
	//Team
	registerSectionWithNavButton("Team", {
		sectionName : "team",
		title : "ByteMind - Team",
		headerTitle : "Das Team",
		description : "The team."
	});
	
	//Code
	registerSectionWithNavButton("Code", {
		sectionName : "code",
		title : "ByteMind - Code",
		headerTitle : "Code Beispiele",
		description : "Some code samples."
	});
	
	//Tech
	registerSectionWithNavButton("Tech", {
		sectionName : "tech",
		title : "ByteMind - Technology",
		headerTitle : "Technologien",
		description : "ByteMind is working with these technologies.",
		onPageLoad : function(){
			var content = document.getElementById('bytemind-brands-page');
			if (content.innerHTML === ''){
				$(content).load("../brands.html #bytemind-brands-content", function(){
					//done
				});
			}
		}
	});
	
	//Imprint
	registerSectionWithNavButton("Impressum", {
		sectionName : "impressum"
	}, '#bytemind-main-footer');
	
	//Spacer at the end (because of the ByteMind logo)
	var navBarSpacer = document.createElement('div');
	navBarSpacer.className = 'bytemind-nav-bar-spacer';
	$('#bytemind-nav-bar').append(navBarSpacer);
	
	//activate first nav button
	//$('.bytemind-nav-bar-button').first().addClass('active');
	
	//Side menu
	var sideMenuEle = document.getElementById('my-bytemind-side-menu');
	var swipeArea = ByteMind.ui.makeAutoResizeSwipeArea(document.getElementById('my-bytemind-side-menu-swipe'));
	var sideMenuOptions = {
		isRightBound : false,					//default menu is on the left side
		swipeAreas : [sideMenuEle, swipeArea],	//areas that can be used to swipe open and close the menu
		onOpenCallback : function(){},
		onCloseCallback : function(){},
		interlayer : '#my-bytemind-side-menu-interlayer',
		menuButton : '#bytemind-menu-btn',
		menuButtonClose : '#bytemind-menu-btn-close'
	};
	sideMenu = new ByteMind.ui.SideMenu(sideMenuEle, sideMenuOptions);
	sideMenu.init();
	//use side menu?
	menuButtonsTotalWidth = 48;
	$('#bytemind-nav-bar').find('.bytemind-nav-bar-button, .bytemind-nav-bar-spacer').each(function(){
		menuButtonsTotalWidth += $(this).outerWidth(true);
	});
	refreshNavigation();
	$(window).on('load resize orientationchange', function() {
		refreshNavigation();
	});
}

function refreshNavigation(){
	var mainWidth = $('#bytemind-main').outerWidth();
	if (!useSideMenu){
		if (mainWidth <= menuButtonsTotalWidth){
			useSideMenu = true;
			menuButtons = $('#bytemind-nav-bar').find('.bytemind-nav-bar-button, .bytemind-nav-bar-spacer');
			menuButtons.detach();
			menuButtons.appendTo('#my-bytemind-side-menu');
			if (sideMenu){
				sideMenu.refresh();
				sideMenu.close();
			}
			$('#bytemind-menu-btn').show();
			//make exceptions for iOS
			if (!ByteMind.ui.isSafari || ByteMind.ui.isStandaloneWebApp){
				$('#my-bytemind-side-menu-swipe').show();
			}
		}
	}else{
		if (mainWidth > menuButtonsTotalWidth){
			useSideMenu = false;
			menuButtons = $('#my-bytemind-side-menu').find('.bytemind-nav-bar-button, .bytemind-nav-bar-spacer');
			menuButtons.detach();
			menuButtons.appendTo('#bytemind-nav-bar');
			if (sideMenu){
				sideMenu.refresh();
				sideMenu.close();
			}
			$('#bytemind-menu-btn').hide();
			//make exceptions for iOS
			if (!ByteMind.ui.isSafari || ByteMind.ui.isStandaloneWebApp){
				$('#my-bytemind-side-menu-swipe').hide();
			}
		}
	}
}

function registerSectionWithNavButton(uiName, data, alternativeTarget){
	//add callback
	data.callback = switchSection;
	//build button
	var btn = document.createElement('button');
	btn.className = 'bytemind-nav-bar-button';
	btn.innerHTML = uiName;
	$(btn).on('click', function(){
		var options = {
			animate : true
		}
		switchSection(data, options);
	});
	$(btn).attr('data-section-btn', data.sectionName);
	if (alternativeTarget){
		$(alternativeTarget).append(btn);
	}else{
		$('#bytemind-nav-bar').append(btn);
	}
	//register action
	ByteMind.page.registerAction(data.sectionName, data);
}

function switchSection(data, options){
	if (activeSection === data.sectionName){
		return;
	}
	var animate, replaceHistory;
	if (options){
		animate = options.animate;
		replaceHistory = options.replaceHistory;
	}
	//header title
	if (data.headerTitle){
		$('.bytemind-page-title').html(data.headerTitle);
	}
	//ui
	if (animate){
		//$('[data-section="' + activeSection + '"]').fadeOut(150, function(){
		$('.bytemind-view').hide();
		$('[data-section="' + data.sectionName + '"]').fadeIn(500);
	}else{
		//$('[data-section="' + activeSection + '"]').hide();
		$('.bytemind-view').hide();
		$('[data-section="' + data.sectionName + '"]').show();
	}
	$('.bytemind-nav-bar-button.active').removeClass('active');
	$('[data-section-btn="' + data.sectionName + '"]').addClass('active');
	//meta
	if (data.title) document.title = data.title;
	if (data.description){
		$('meta[name=description]').remove();
		$('head').append( '<meta name="description" content="' + data.description + '">' );
	}
	//set history
	var urlParams = '';
	if (window.location.href.indexOf('?') >= 0){
		urlParams = window.location.href.replace(/.*(\?.*?)(#!|$).*/,"$1").trim();
	}
	var newHref = (window.location.href.replace(/(\?.*?#!.*|#!.*|\?.*)/,"").trim()  + "#!" + data.sectionName + urlParams).trim();
	if (!replaceHistory){
		if (newHref !== window.location.href){
			history.pushState({sectionName : data.sectionName}, "", newHref);
		}
	}else{
		history.replaceState({sectionName : data.sectionName}, "", newHref);
	}
	activeSection = data.sectionName;
	//onPageLoad
	if (data.onPageLoad) data.onPageLoad();
}

//----------------

//CONFIG
function bytemind_build_config(){
	var Config = {};
	
	Config.language = ByteMind.page.getURLParameter("lang") || navigator.language || navigator.userLanguage;
	if (Config.language && Config.language.toLowerCase().indexOf('de') === 0){
		Config.language = 'de';
	}else{
		Config.language = 'en';
	}
	
	Config.clientInfo = "website";
		
	return Config;
}

//PAGE TOOLS
function bytemind_build_page(){
	var Page = {};
	
	var pageActions = {};
	
	//register a page action
	Page.registerAction = function(name, data){
		pageActions[name] = data;
	}
	//activate page action by URL
	Page.checkUrlForAction = function(){
		var actionName = "";
		// if (window.location.pathname.search(/\/\w+/) === 0){
		//	actionName = window.location.pathname.substr(1).replace(/\?.*/,'').trim();	
		//}else 
		if (window.location.href.search(/(#!|&|\?)/) >= 0){
			//get hash-bang or the URL parameters action, a, page, p
			actionName = Page.getFirstURLParameter('(action|page|a|p)');
			if (!actionName && window.location.hash.search(/(#!)/) === 0){
				actionName = window.location.hash.substr(2).replace(/\?.*/,'').trim();
			}
		}
		if (actionName){
			var data = pageActions[actionName];
			if (data){
				Page.activateAction(data);
				return true;
			}
		}
		return false;
	}
	//activate page action with data
	Page.activateAction = function(data, options){
		if (data.callback) data.callback(data, options);
	}
	//activate page action by name
	Page.activateActionByName = function(actionName, options){
		var data = pageActions[actionName];
		if (data){
			Page.activateAction(data, options);
			return true;
		}
		return false;
	}
	
	//get URL parameters
	Page.getURLParameter = function(name){
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
	}
	Page.getFirstURLParameter = function(namesRegex){
		return decodeURIComponent((new RegExp('[?|&]' + namesRegex + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,"",""])[2].replace(/\+/g, '%20'))||null
	}
	
	//set or add a parameter of a given URL with encoding and return modified url
	Page.setParameterInURL = function(url, parameter, value){
		if ((url.indexOf('?' + parameter + '=') > -1) || (url.indexOf('&' + parameter + '=') > -1)){
			url = url.replace(new RegExp("(\\?|&)(" + parameter + "=.*?)(&|$)"), "$1" + parameter + "=" + encodeURIComponent(value) + "$3");
		}else{
			if (url.indexOf('?') > -1){
				url += '&' + parameter + "=" + encodeURIComponent(value);
			}else{
				url += '?' + parameter + "=" + encodeURIComponent(value);
			}
		}
		return url;
	}
	
	return Page;
}

//DEBUG
function bytemind_build_debug(){
	var Debug = {};
	
	Debug.doLog = true;
	Debug.doError = true;
	Debug.doInfo = false;
	
	Debug.log = function(msg){
		if (Debug.doLog){
			console.log('ByteMind - ' + (new Date().getTime().toLocaleDateString()) + ' - LOG - ' + msg);
		}
	}
	Debug.err = function(msg){
		if (Debug.doError){
			console.error('ByteMind - ' + (new Date().getTime().toLocaleDateString()) + ' - ERROR - ' + msg);
		}
	}
	Debug.info = function(msg){
		if (Debug.doInfo){
			console.log('ByteMind - ' + (new Date().getTime().toLocaleDateString()) + ' - INFO - ' + msg);
		}
	}
	
	return Debug;
}