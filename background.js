var DEBUG = true;
if(DEBUG) console.log("webcolor extension is enabled");

var KEY_ENABLED = "isEnabled";
var KEY_THEME_ID = "theme";
var KEY_BRIGHTNESS = "brightness";
var KEY_CONTRAST = "contrast";
var KEY_DEPTH = "depth";
var KEY_CUSTOM_THEMES = "customThemes";

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

var currentThemeID = "";
var preSetThemes;
var customThemes = {};

chrome.storage.local.get([KEY_BRIGHTNESS, KEY_CONTRAST, KEY_ENABLED, KEY_DEPTH, KEY_THEME_ID, KEY_CUSTOM_THEMES], function(result){
    if(result[KEY_ENABLED] != 0){
        values[KEY_ENABLED] = result[KEY_ENABLED];
    }

    if(result[KEY_BRIGHTNESS] != null){
        values[KEY_BRIGHTNESS] = result[KEY_BRIGHTNESS];
    }

    if(result[KEY_CONTRAST] != null){
        values[KEY_CONTRAST] = result[KEY_CONTRAST];
    }

    if(result[KEY_DEPTH] != null){
        values[KEY_DEPTH] = result[KEY_DEPTH];
    }

    currentThemeID = result[KEY_THEME_ID];

    if(result[KEY_CUSTOM_THEMES] != null){
        if(DEBUG) console.log(result[KEY_CUSTOM_THEMES]);
        customThemes = JSON.parse(result[KEY_CUSTOM_THEMES]);
    }
});

function saveValue(key, value){
    values[key] = value;
    var obj = {};
    obj[key] = value;
    chrome.storage.local.set(obj);
}

/**
 * Add a new user defined theme.
 * @return true if save successfully, false otherwise.
 */
function addTheme(theme){
    var id;
    var tryCount = 0;
    do{
        tryCount++;
        if(tryCount > 3){
            return false;
        }
        id = getUniqueID();
    }while(customThemes[id] != undefined);

    return saveTheme(id, theme);
}

/**
 * Save the theme.
 */
function saveTheme(id, theme){
    customThemes[id] = theme;
    var stringifyThemes = JSON.stringify(customThemes);
    if(DEBUG) console.log(stringifyThemes);

    var obj = {};
    obj[KEY_CUSTOM_THEMES] = stringifyThemes;
    chrome.storage.local.set(obj);
    return true;
}

function deleteTheme(id){
    if(DEBUG) console.log("deleteTheme");
    delete customThemes[id];
    var stringifyThemes = JSON.stringify(customThemes);
    if(DEBUG) console.log(stringifyThemes);

    obj[KEY_CUSTOM_THEMES] = stringifyThemes;
    chrome.storage.local.set(obj);
}

function getUniqueID(){
    var time = new Date().getTime();
    var randNum = Math.round(Math.random() * 10000);
    var id = "ct" + time + "-" + randNum;
    if(DEBUG) console.log("generated ID=" + id);
    return id;
}

/**
 * @return return the theme object of the id.
 */
function getTheme(themeId){
    if(DEBUG) console.log("getTheme id=" + themeId + "typeof=" + (typeof themeId));
    if(themeId){
        if(themeId.startsWith("t")){
            if(DEBUG) console.log("preSetTheme");
            return preSetThemes[themeId];
        } else {
            if(DEBUG) console.log("customThemes");
            return customThemes[themeId];
        }
    }
    return undefined;
}

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        preSetThemes = JSON.parse(xhr.responseText);
    }
};
xhr.open('GET', chrome.extension.getURL('data/preSetTheme.json'), true);
xhr.send();

chrome.tabs.query({status: "complete"}, function(tabs){
    if(DEBUG) console.log("background page, enabled tabs.length=" + tabs.length);
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
            code: 'html.tlvNightModeOn, html.tlvNightModeOn > body, html.tlvNightModeOn > body > *, html.tlvNightModeOn *:not([aria-hidden=true]).withBgColor:not(.withBgImage) {background-color: ' + theme.bgColor + ' !important;}html.tlvNightModeOn * {color: ' + theme.textColor + ' !important;border-color: ' + theme.borderColor + ' !important;box-shadow: none !important;}html.tlvNightModeOn ::selection {background: rgba(142,142,142,0.3) !important;}html.tlvNightModeOn a:link {color: ' + theme.linkColor + ' !important;}html.tlvNightModeOn a:visited {color: ' + theme.visitedLinkColor + ' !important;}html.tlvNightModeOn img, html.tlvNightModeOn .withBgImage {background-color: rgba(0,0,0,0) !important;/*-webkit-filter: brightness(100%) contrast(100%) !important;*/}'
        });
    }
}

chrome.tabs.onUpdated.addListener(function(tabsId, changeInfo, tab){
    if(DEBUG) console.log("tabs.onUpdated tabsId=" + tabsId + " url=" + tab.url + ", changeInfo.url=" + changeInfo.url);
    if(changeInfo.url && tab.url && !tab.url.startsWith("chrome://")){
        if(DEBUG) console.log("tabs.onUpdated do insert");
        insertCSS(tabsId, getTheme(currentThemeID));
    }
});
