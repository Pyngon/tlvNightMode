console.log("extension is enabled");

var KEY_ENABLED = "isEnabled";
var KEY_THEME_ID = "theme";
var KEY_BRIGHTNESS = "brightness";
var KEY_CONTRAST = "contrast";
var KEY_DEPTH = "depth";

var MIN_BRIGHTNESS = 0;
var MAX_BRIGHTNESS = 200;
var MIN_CONTRAST = 0;
var MAX_CONTRAST = 200;
var MIN_DEPTH = 0;
var MAX_DEPTH = 100;

var values = {};
values[KEY_ENABLED] = 1;
values[KEY_BRIGHTNESS] = 100;
values[KEY_CONTRAST] = 100;
values[KEY_DEPTH] = 20;

chrome.storage.local.get([KEY_BRIGHTNESS, KEY_CONTRAST, KEY_ENABLED, KEY_DEPTH, KEY_THEME_ID], function(result){
    if(result[KEY_ENABLED] != 0){
        values[KEY_ENABLED] = result[KEY_ENABLED];

    //     values[KEY_ENABLED] = true;
    //     // chkbOnOff.checked = true;
    // } else {
    //     // chkbOnOff.checked = false;
    //     values[KEY_ENABLED] = false;
    }

    if(result[KEY_BRIGHTNESS] != null){
        values[KEY_BRIGHTNESS] = result[KEY_BRIGHTNESS];
    }

    if(result[bgPage.KEY_CONTRAST] != null){
        values[KEY_CONTRAST] = result[KEY_CONTRAST];
    }

    if(result[KEY_DEPTH] != null){
        values[KEY_DEPTH] = result[KEY_DEPTH];
    }

    currentThemeID = result[KEY_THEME_ID];
});

function saveValue(key, value){
    values[key] = value;

    var obj = {};
    obj[key] = value;
    chrome.storage.local.set(obj);
}

var currentThemeID = null;
var preSetThemes;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        preSetThemes = JSON.parse(xhr.responseText);
    }
};
xhr.open('GET', chrome.extension.getURL('data/preSetTheme.json'), true);
xhr.send();

chrome.tabs.query({status: "complete"}, function(tabs){
    console.log("background page, enabled tabs.length=" + tabs.length);
    for(var i=0;i<tabs.length;i++){
        if(!tabs[i].url.startsWith("chrome://")){
            chrome.tabs.insertCSS(tabs[i].id, {
                file: "default.css",
                allFrames: true
            });
            chrome.tabs.executeScript(tabs[i].id, {
                file: "changeColor.js",
                allFrames: true
            });
        }
    }
});

function insertCSS(tabId, theme){
    if(theme != null){
        chrome.tabs.insertCSS(tabId, {
            code: 'html.recolor-enabled, html.recolor-enabled > body, html.recolor-enabled > body > *, html.recolor-enabled *:not([aria-hidden=true]).withBgColor:not(.withBgImage) {background-color: ' + theme.bgColor + ' !important;}html.recolor-enabled * {color: ' + theme.textColor + ' !important;border-color: ' + theme.borderColor + ' !important;box-shadow: none !important;}html.recolor-enabled ::selection {background: rgba(142,142,142,0.3) !important;}html.recolor-enabled a:link {color: ' + theme.linkColor + ' !important;}html.recolor-enabled a:visited {color: ' + theme.visitedLinkColor + ' !important;}html.recolor-enabled img, html.recolor-enabled .withBgImage {background-color: rgba(0,0,0,0) !important;/*-webkit-filter: brightness(100%) contrast(100%) !important;*/}'
        });
    }
}

chrome.tabs.onUpdated.addListener(function(tabsId, changeInfo, tab){
    console.log("tabs.onUpdated tabsId=" + tabsId + " url=" + tab.url + ", changeInfo.url=" + changeInfo.url);
    if(changeInfo.url && tab.url && !tab.url.startsWith("chrome://")){
        console.log("tabs.onUpdated do insert");
        insertCSS(tabsId, preSetThemes[currentThemeID]);
    }
});
