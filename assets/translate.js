var technicalContact = "admin@" + document.location.host.split(".").slice(-2).join(".");
document.getElementById("contact").href = "mailto:" + technicalContact;
document.getElementById("contact").innerText = technicalContact;

var getAvailableLanguages = function getAvailableLanguages() {
	var availableLanguages = [];
	var localizedNodes = document.getElementsByClassName("lang");
	for (var i=0; i<localizedNodes.length; i++) {
		var match = /lang_([a-z\-_]+)/.exec(localizedNodes[i].className);
		if (match && availableLanguages.indexOf(match[1]) === -1) {
			availableLanguages.push(match[1]);
		}
	}
	return availableLanguages;
};

var getAcceptedLanguage = function getAcceptedLanguage(availableLanguages) {
    var nav = window.navigator,
    browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
    i,
    language;

    // support for HTML 5.1 "navigator.languages"
    if (Array.isArray(nav.languages)) {
      for (i = 0; i < nav.languages.length; i++) {
        language = nav.languages[i];
        if (language && language.length && availableLanguages.indexOf(language.toLowerCase()) !== -1) {
	      return language.toLowerCase();
	    }
	    if (language && language.length && availableLanguages.indexOf(language.split(/[\-_]/g)[0].toLowerCase()) !== -1) {
		  return language.split(/[\-_]/g)[0].toLowerCase();
	    }
      }
    }

    // support for other well known properties in browsers
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
      language = nav[browserLanguagePropertyKeys[i]];
      if (language && language.length && availableLanguages.indexOf(language.toLowerCase()) !== -1) {
        return language.toLowerCase();
      }
      if (language && language.length && availableLanguages.indexOf(language.split(/[\-_]/g)[0].toLowerCase()) !== -1) {
	    return language.split(/[\-_]/g)[0].toLowerCase();
	  }
    }

    return availableLanguages[0];
};

var hideAllLanguages = function hideAllLanguages() {
	var localizedNodes = document.getElementsByClassName("lang");
	for (var i=0; i<localizedNodes.length; i++) {
		if (!/hidden/.test(localizedNodes[i].className)) {
			localizedNodes[i].className = localizedNodes[i].className + " hidden";
		}
	}
};

var showAcceptedLanguage = function showAcceptedLanguage(acceptedLanguage) {
	var acceptedNodes = document.getElementsByClassName("lang_"+acceptedLanguage);
	for (var i=0; i<acceptedNodes.length; i++) {
		acceptedNodes[i].className = acceptedNodes[i].className.replace(/ *hidden */g, "");
	}
};

var updateTitle = function updateTitle(acceptedLanguage) {
	var acceptedTitleNodes = document.getElementsByClassName("title lang_"+acceptedLanguage);
	document.title = acceptedTitleNodes[0].innerText;
};

var availableLanguages = getAvailableLanguages();
var acceptedLanguage = getAcceptedLanguage(availableLanguages);
hideAllLanguages();
showAcceptedLanguage(acceptedLanguage);
updateTitle(acceptedLanguage);