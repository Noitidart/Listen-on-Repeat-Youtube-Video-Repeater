const {interfaces: Ci,	utils: Cu} = Components;
const self = {
	name: 'Listen on Repeat Youtube Video Repeater',
	id: 'Listen-on-Repeat-Youtube-Video-Repeater@jetpack',
	path: {
		content: 'chrome://listen-on-repeat-youtube-video-repeater/content/',
		locale: 'chrome://listen-on-repeat-youtube-video-repeater/locale/'
	}
};

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource:///modules/CustomizableUI.jsm');

const myServices = {};
Cu.import('resource://gre/modules/XPCOMUtils.jsm');
XPCOMUtils.defineLazyGetter(myServices, 'stringBundle', function () { return Services.strings.createBundle(self.path.locale + 'bootstrap.properties?' + Math.random()) /* Randomize URI to work around bug 719376 */ });

const uri_cuiCss =  Services.io.newURI(self.path.content + 'cui.css', null, null);

/*start - windowlistener*/
var windowListener = {
	//DO NOT EDIT HERE
	onOpenWindow: function (aXULWindow) {
		// Wait for the window to finish loading
		let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		aDOMWindow.addEventListener("load", function () {
			aDOMWindow.removeEventListener("load", arguments.callee, false);
			windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
		}, false);
	},
	onCloseWindow: function (aXULWindow) {},
	onWindowTitleChange: function (aXULWindow, aNewTitle) {},
	register: function () {
		// Load into any existing windows
		let XULWindows = Services.wm.getXULWindowEnumerator(null);
		while (XULWindows.hasMoreElements()) {
			let aXULWindow = XULWindows.getNext();
			let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
			windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
		}
		// Listen to new windows
		Services.wm.addListener(windowListener);
	},
	unregister: function () {
		// Unload from any existing windows
		let XULWindows = Services.wm.getXULWindowEnumerator(null);
		while (XULWindows.hasMoreElements()) {
			let aXULWindow = XULWindows.getNext();
			let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
			windowListener.unloadFromWindow(aDOMWindow, aXULWindow);
		}
		//Stop listening so future added windows dont get this attached
		Services.wm.removeListener(windowListener);
	},
	//END - DO NOT EDIT HERE
	loadIntoWindow: function (aDOMWindow, aXULWindow) {
		if (!aDOMWindow) {
			return;
		}
		if (aDOMWindow.gBrowser) {
			var domWinUtils = aDOMWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
			domWinUtils.loadSheet(uri_cuiCss, domWinUtils.AUTHOR_SHEET); //0 == agent_sheet 1 == user_sheet 2 == author_sheet
		} else {
			//window does not have gBrowser
		}
	},
	unloadFromWindow: function (aDOMWindow, aXULWindow) {
		if (!aDOMWindow) {
			return;
		}
		if (aDOMWindow.gBrowser) {
			var domWinUtils = aDOMWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
			domWinUtils.removeSheet(uri_cuiCss, domWinUtils.AUTHOR_SHEET); //0 == agent_sheet 1 == user_sheet 2 == author_sheet
		} else {
			//window does not have gBrowser
		}
	}
};
/*end - windowlistener*/

function startup(aData, aReason) {
	
	CustomizableUI.createWidget({
		id: 'loryvr_cui',
		defaultArea: CustomizableUI.AREA_NAVBAR,
		label: myServices.stringBundle.GetStringFromName('repeat_video'),
		tooltiptext: myServices.stringBundle.GetStringFromName('repeat_at_listenonrepeat_com'),
		onCommand: function(aEvent) {
			let win = aEvent.target.ownerDocument.defaultView;
			if (win.gBrowser.selectedTab.linkedBrowser.contentWindow.location.host == 'www.youtube.com') {
				win.gBrowser.selectedTab.linkedBrowser.contentWindow.location = win.gBrowser.selectedTab.linkedBrowser.contentWindow.location.href.replace('youtube.com', 'listenonrepeat.com');
			} else {
				win.gBrowser.selectedTab.linkedBrowser.contentWindow.alert(myServices.stringBundle.GetStringFromName('not_on_youtube'));
			}
		}
	});
	
	windowListener.register();
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) return;
	CustomizableUI.destroyWidget('loryvr_cui');
	windowListener.unregister();
}

function install() {}

function uninstall() {}
