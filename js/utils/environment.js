  (function(OO,_,HM) {
    // Ensure playerParams exists
    OO.playerParams = HM.safeObject('environment.playerParams', OO.playerParams,{});

    // Init publisher's OO.playerParams via player parameter object
    OO.configurePublisher = function(parameters) {
      OO.playerParams.pcode = OO.playerParams.pcode || parameters.pcode || '';
      OO.playerParams.playerBrandingId = OO.playerParams.playerBrandingId || parameters.playerBrandingId || '';
      OO.playerParams.debug = OO.playerParams.debug || parameters.debug || '';
    };

    OO.isPublisherConfigured = function() {
      return OO.playerParams.pcode && OO.playerParams.playerBrandingId;
    };

    // process tweaks
    // tweaks is optional. Hazmat takes care of this but throws an undesirable warning.
    OO.playerParams.tweaks = OO.playerParams.tweaks || '';
    OO.playerParams.tweaks = HM.safeString('environment.playerParams.tweaks', OO.playerParams.tweaks,'');
    OO.playerParams.tweaks = OO.playerParams.tweaks.split(',');

    // explicit list of supported tweaks
    OO.tweaks = {};
    OO.tweaks["android-enable-hls"] = _.contains(OO.playerParams.tweaks, 'android-enable-hls');
    OO.tweaks["html5-force-mp4"] = _.contains(OO.playerParams.tweaks, 'html5-force-mp4');

    // Max timeout for fetching ads metadata, default to 3 seconds.
    OO.playerParams.maxAdsTimeout = OO.playerParams.maxAdsTimeout || 5;
    // max wrapper ads depth we look, we will only look up to 3 level until we get vast inline ads
    OO.playerParams.maxVastWrapperDepth = OO.playerParams.maxVastWrapperDepth || 3;
    OO.playerParams.minLiveSeekWindow = OO.playerParams.minLiveSeekWindow || 10;

    // Ripped from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    OO.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
    OO.playerCount = 0;

    // Check environment to see if this is prod
    OO.isProd = OO.playerParams.environment &&
                OO.playerParams.environment.match(/^prod/i);

    // Environment invariant.
    OO.platform = window.navigator.platform;
    OO.os = window.navigator.appVersion;
    OO.supportsVideo = !!document.createElement('video').canPlayType;

    OO.browserSupportsCors = (function() {
      try {
        return _.has(new XMLHttpRequest(), "withCredentials") ||
          _.has(XMLHttpRequest.prototype, "withCredentials");
      } catch(e) {
        return false;
      }
    }());

    OO.isWindows = (function() {
      return OO.platform.match(/Win/);
    }());

    OO.isIos = (function() {
      return OO.platform.match(/iPhone/) || OO.platform.match(/iPad/) || OO.platform.match(/iPod/);
    }());

    OO.isIphone = (function() {
      return OO.platform.match(/iPhone/) || OO.platform.match(/iPod/);
    }());

    OO.isIpad = (function() {
      return OO.platform.match(/iPad/);
    }());

    OO.iosMajorVersion = (function() {
      try {
        if (window.navigator.userAgent.match(/(iPad|iPhone|iPod)/)) {
          return parseInt(window.navigator.userAgent.match(/OS (\d+)/)[1], 10);
        } else {
          return null;
        }
      } catch(err) {
        return null;
      }
    }());

    OO.isAndroid = (function() {
      return OO.os.match(/Android/);
    }());

    OO.isAndroid4Plus = (function() {
      return OO.isAndroid && !OO.os.match(/Android [23]/);
    }());

    OO.isRimDevice = (function() {
      return OO.os.match(/BlackBerry/) ||  OO.os.match(/PlayBook/);
    }());

    OO.isFirefox = (function() {
      return !!window.navigator.userAgent.match(/Firefox/);
    }());

    OO.isChrome = (function () {
      return !!window.navigator.userAgent.match(/Chrome/);
    }());

    OO.isSafari = (function () {
      return (!!window.navigator.userAgent.match(/AppleWebKit/) &&
              !window.navigator.userAgent.match(/Chrome/)) ;
    }());

    OO.chromeMajorVersion = (function () {
      try {
        return parseInt(window.navigator.userAgent.match(/Chrome.([0-9]*)/)[1], 10);
      } catch(err) {
        return null;
      }
    }());

    OO.isIE = (function(){
      return !!window.navigator.userAgent.match(/MSIE/) || !!window.navigator.userAgent.match(/Trident/);
    }());

    OO.isIE11Plus = (function(){
      // check if IE
      if (!window.navigator.userAgent.match(/Trident/)) {
        return false;
      }

      // extract version number
      var ieVersionMatch = window.navigator.userAgent.match(/rv:(\d*)/);
      var ieVersion = ieVersionMatch && ieVersionMatch[1];
      return ieVersion >= 11;
    }());

    OO.isWinPhone = (function(){
      return !!OO.os.match(/Windows Phone/) || !!OO.os.match(/ZuneWP/) || !!OO.os.match(/XBLWP/);
    }());

    OO.isSmartTV = (function(){
      return (!!window.navigator.userAgent.match(/SmartTV/) ||
             !!window.navigator.userAgent.match(/NetCast/));
    }());

    OO.isMacOs = (function() {
      return !OO.isIos && !!OO.os.match(/Mac/);
    }());

    OO.isMacOsLionOrLater = (function() {
      // TODO: revisit for Firefox when possible/necessary
      var macOs = OO.os.match(/Mac OS X ([0-9]+)_([0-9]+)/);
      if (macOs == null || macOs.length < 3) { return false; }
      return (parseInt(macOs[1],10) >= 10 && parseInt(macOs[2],10) >= 7);
    }());

    OO.isKindleHD = (function(){
      return !!OO.os.match(/Silk\/2/);
    }());

    OO.supportAds = (function() {
      // We are disabling ads for Android 2/3 device, the reason is that main video is not resuming after
      // ads finish. Util we can figure out a work around, we will keep ads disabled.
      return !OO.isWinPhone && !OO.os.match(/Android [23]/);
    }());

    OO.allowGesture = (function() {
      return OO.isIos;
    }());

    OO.allowAutoPlay = (function() {
      return !OO.isIos && !OO.isAndroid;
    }());

    OO.supportTouch = (function() {
      // IE8- doesn't support JS functions on DOM elements
      if (document.documentElement.hasOwnProperty && document.documentElement.hasOwnProperty("ontouchstart")) { return true; }
      return false;
    }());

    OO.docDomain = (function() {
      var domain = null;
      try {
        domain = document.domain;
      } catch(e) {}
      if (!OO._.isEmpty(domain)) { return domain; }
      if (OO.isSmartTV) { return 'SmartTV'; }
      return 'unknown';
    }());

    OO.uiParadigm = (function() {
      var paradigm = 'tablet';

      // The below code attempts to decide whether or not we are running in 'mobile' mode
      // Meaning that no controls are displayed, chrome is minimized and only fullscreen playback is allowed
      // Unfortunately there is no clean way to figure out whether the device is tablet or phone
      // or even to properly detect device screen size http://tripleodeon.com/2011/12/first-understand-your-screen/
      // So there is a bunch of heuristics for doing just that
      // Anything that is not explicitly detected as mobile defaults to desktop
      // so worst case they get ugly chrome instead of unworking player
      if(OO.isAndroid4Plus && OO.tweaks["android-enable-hls"]) {
        // special case for Android 4+ running HLS
        paradigm = 'tablet';
      } else if(OO.isIphone) {
        paradigm = 'mobile-native';
      } else if(OO.os.match(/BlackBerry/)) {
        paradigm = 'mobile-native';
      } else if(OO.os.match(/iPad/)) {
        paradigm = 'tablet';
      } else if(OO.isKindleHD) {
        // Kindle Fire HD
        paradigm = 'mobile-native';
      } else if(OO.os.match(/Silk/)) {
        // Kindle Fire
        paradigm = 'mobile';
      } else if(OO.os.match(/Android 2/)) {
        // On Android 2+ only window.outerWidth is reliable, so we are using that and window.orientation
        if((window.orientation % 180) == 0 &&  (window.outerWidth / window.devicePixelRatio) <= 480 ) {
          // portrait mode
          paradigm = 'mobile';
        } else if((window.outerWidth / window.devicePixelRatio) <= 560 ) {
          // landscape mode
          paradigm = 'mobile';
        }
      } else if(OO.os.match(/Android/)) {
          paradigm = 'tablet';
      } else if (OO.isWinPhone) {
        // Windows Phone is mobile only for now, tablets not yet released
        paradigm = 'mobile';
      } else if(!!OO.platform.match(/Mac/)    // Macs
                || !!OO.platform.match(/Win/)  // Winboxes
                || !!OO.platform.match(/Linux/)) {    // Linux
        paradigm = 'desktop';
      }

      return paradigm;
    }());

    OO.supportMultiVideo = (function() {
      // short cut for Android non-chrome browser.
      if (OO.isAndroid && !OO.isChrome) { return false; }
      return !OO.isIos && !OO.os.match(/Android [23]/);
    }());

    OO.supportedVideoTypes = (function() {
      // tweak to force MP4 playback
      if (!!OO.tweaks["html5-force-mp4"]) {
        return { mp4:true };
      }

      // (PBW-1969) Special case since Windows user-agent includes 'like iPhone'
      if (!!OO.isWinPhone) {
        return { mp4:true };
      }

      // Sony OperaTV based supports HLS but doesn't properly report it so we are forcing it here
      if(window.navigator.userAgent.match(/SonyCEBrowser/)) {
        return { m3u8:true };
      }

      // The android is a special case because of it's crappy HLS support
      if(!!OO.isAndroid) {
        if (OO.tweaks["android-enable-hls"] && OO.isAndroid4Plus) {
          return { m3u8:true, mp4:true }; // Allow HLS despite our best intentions (PBK-125)
        }
        return { mp4:true };
      }

      // Smart TV hack, neither Samsung/LG plays hls correctly for their 2012 models.
      if (OO.isSmartTV) {
        return { mp4:true };
      }

      var video = document.createElement('video');
      if (typeof video.canPlayType !== "function") {
        return {};
      }
      return {
        m3u8: (!!video.canPlayType("application/vnd.apple.mpegurl") ||
               !!video.canPlayType("application/x-mpegURL")) &&
               !OO.isRimDevice && (!OO.isMacOs || OO.isMacOsLionOrLater),
        mp4: !!video.canPlayType("video/mp4"),
        webm: !!video.canPlayType("video/webm")
      };
    }());

    // TODO(jj): need to make this more comprehensive
    // Note(jj): only applies to mp4 videos for now
    OO.supportedVideoProfiles = (function() {
      // iOS only supports baseline profile
      if (OO.isIos || OO.isAndroid) {
        return "baseline";
      }
      return null;
    }());

    // TODO(bz): add flash for device when we decide to use stream data from sas
    // TODO(jj): add AppleTV and other devices as necessary
    OO.device = (function() {
        var device = 'html5';
        if (OO.isIphone) { device = 'iphone-html5'; }
        else if (OO.isIpad) { device = 'ipad-html5'; }
        else if (OO.isAndroid) { device = 'android-html5'; }
        else if (OO.isRimDevice) { device = 'rim-html5'; }
        else if (OO.isWinPhone) { device = 'winphone-html5'; }
        else if (OO.isSmartTV) { device = 'smarttv-html5'; }
        return device;
    }());

    // list of environment-specific modules needed by the environment or empty to include all
    // Note: should never be empty because of html5
    OO.environmentRequiredFeatures = (function(){
      var features = [];

      if (OO.os.match(/Android 2/)) {  // safari android
        features.push('html5-playback');
      } else { // normal html5
        features.push('html5-playback');
        if (OO.supportAds) { features.push('ads'); }
      }

      return _.reduce(features, function(memo, feature) {return memo+feature+' ';}, '');
    }());

    OO.supportMidRollAds = (function() {
      return (OO.uiParadigm === "desktop" && !OO.isIos && !OO.isRimDevice);
    }());

    OO.supportCookies = (function() {
      document.cookie = "ooyala_cookie_test=true";
      var cookiesSupported = document.cookie.indexOf("ooyala_cookie_test=true") >= 0;
      document.cookie = "ooyala_cookie_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return cookiesSupported;
    }());

    OO.isSSL = document.location.protocol == "https:";

    OO.SERVER =
    {
      API: OO.isSSL ? OO.playerParams.api_ssl_server || "https://player.ooyala.com" :
                      OO.playerParams.api_server || "http://player.ooyala.com",
      AUTH: OO.isSSL ? OO.playerParams.auth_ssl_server || "https://player.ooyala.com/sas" :
                      OO.playerParams.auth_server || "http://player.ooyala.com/sas",
      ANALYTICS: OO.isSSL ? OO.playerParams.analytics_ssl_server || "https://player.ooyala.com" :
                            OO.playerParams.analytics_server || "http://player.ooyala.com",
      HASTUR: OO.isSSL ? OO.playerParams.hastur_ssl_server ||
                         (OO.isProd ? "https://l.ooyala.com/player_events" :
                                      "https://l-staging.ooyala.com/player_events") :
                         OO.playerParams.hastur_server ||
                         (OO.isProd ? "http://l.ooyala.com/player_events" :
                                      "http://l-staging.ooyala.com/player_events")
    };

    // returns true iff environment-specific feature is required to run in current environment
    OO.requiredInEnvironment = OO.featureEnabled = function(feature) {
      return !!OO.environmentRequiredFeatures.match(new RegExp(feature));
    };

    // Detect Chrome Extension. We will recieve an acknowledgement from the content script, which will prompt us to start sending logs
    OO.chromeExtensionEnabled = document.getElementById('ooyala-extension-installed') ? true : false;

    // Locale Getter and Setter
    OO.locale = "";
    OO.setLocale = function(locale) {
      OO.locale = locale.toUpperCase();
    };
    OO.getLocale = function() {
      return (OO.locale || document.documentElement.lang || navigator.language ||
              navigator.userLanguage || "en").substr(0,2).toUpperCase();
    };
  }(OO, OO._, OO.HM));