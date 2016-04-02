console.log("extension is enabled");
var currentThemeID = null;
var preSetThemes;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        preSetThemes = JSON.parse(xhr.responseText);
    }
};
xhr.open('GET', chrome.extension.getURL('preSetTheme.json'), true);
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
