var KEY_ENABLED = "isEnabled";
var KEY_THEME_ID = "theme";
var KEY_BRIGHTNESS = "brightness";
var KEY_CONTRAST = "contrast";
var KEY_DEPTH = "depth";

var valueEnabled = true;
var valueBrightness = 100;
var valueContrast = 100;
var valueDepth = 20;
// var currentThemeID = null;

var bgPage = chrome.extension.getBackgroundPage();

function saveToStorage(key, value){
    var obj = {};
    obj[key] = value;
    chrome.storage.local.set(obj);
}

function enableFunction(evt){
    chrome.storage.local.get(KEY_ENABLED, function(result){
        console.log("local.get=" + result[KEY_ENABLED]);
        if(result[KEY_ENABLED] != 0){
            var obj = {};
            obj[KEY_ENABLED] = 0;

            chrome.storage.local.set(obj);
            evt.target.innerHTML = "Disabled";
            sendMessageToContentScript(false);
        } else {
            var obj = {};
            obj[KEY_ENABLED] = 1;

            chrome.storage.local.set(obj);
            evt.target.innerHTML = "Enabled";
            sendMessageToContentScript(true);
        }
    });
}

function sendMessageToContentScript(isEnabled){
    chrome.tabs.query({status: "complete"}, function(tabs){
        console.log("tabs.length=" + tabs.length);
        for(var i=0;i<tabs.length;i++) {
            chrome.tabs.sendMessage(tabs[i].id, {isEnable: isEnabled}, function(response){
                console.log("contentScript is done.");
            });
        }
    });
}

/* page event */

document.addEventListener("DOMContentLoaded", function(){
    var menu = document.getElementById("menuTheme");
    var item;
    for(var i in chrome.extension.getBackgroundPage().preSetThemes){
        item = document.createElement("li");
        item.innerText = i;
        item.id = i;
        item.addEventListener("click", changeTheme);
        menu.appendChild(item);
    }

    var btnEnable = document.getElementById("btnEnable");
    btnEnable.addEventListener("click", enableFunction);

    var sbBrightness = document.getElementById("sbBrightness");
    var txtBrightness = document.getElementById("txtBrightness");
    sbBrightness.addEventListener("input", function(ev){
        txtBrightness.innerText = ev.target.value;
        valueBrightness = ev.target.value;
        saveToStorage(KEY_BRIGHTNESS, valueBrightness);

        chrome.tabs.query({active: true}, function(tabs){
            for(var i=0;i<tabs.length;i++) {
                chrome.tabs.insertCSS(tabs[i].id, {
                    code: 'html.recolor-enabled img, html.recolor-enabled .withBgImage {-webkit-filter: brightness(' + valueBrightness + '%) contrast(' + valueContrast + '%) !important;}'
                });
            }
        });
    });
    var sbContrast = document.getElementById("sbContrast");
    var txtContrast = document.getElementById("txtContrast");
    sbContrast.addEventListener("input", function(ev){
        txtContrast.innerText = ev.target.value;
        valueContrast = ev.target.value;
        saveToStorage(KEY_CONTRAST, valueContrast);

        chrome.tabs.query({active: true}, function(tabs){
            for(var i=0;i<tabs.length;i++) {
                chrome.tabs.insertCSS(tabs[i].id, {
                    code: 'html.recolor-enabled img, html.recolor-enabled .withBgImage {-webkit-filter: brightness(' + valueBrightness + '%) contrast(' + valueContrast + '%) !important;}'
                });
            }
        });
    });
    var sbDepth = document.getElementById("sbDepth");
    var txtDepth = document.getElementById("txtDepth");
    sbDepth.addEventListener("input", function(ev){
        txtDepth.innerText = ev.target.value;
        valueDepth = ev.target.value;
        saveToStorage(KEY_DEPTH, valueDepth);
    });

    chrome.storage.local.get([KEY_BRIGHTNESS, KEY_CONTRAST, KEY_ENABLED, KEY_DEPTH, KEY_THEME_ID], function(result){
        if(result[KEY_ENABLED] != 0){
            btnEnable.innerHTML = "Enabled";
        } else {
            btnEnable.innerHTML = "Disabled";
        }

        if(result[KEY_BRIGHTNESS] != null){
            valueBrightness = result[KEY_BRIGHTNESS];
            sbBrightness.value = result[KEY_BRIGHTNESS];
            txtBrightness.innerText = result[KEY_BRIGHTNESS];
        }

        if(result[KEY_CONTRAST] != null){
            valueContrast = result[KEY_CONTRAST];
            sbContrast.value = result[KEY_CONTRAST];
            txtContrast.innerText = result[KEY_CONTRAST];
        }

        if(result[KEY_DEPTH] != null){
            valueContrast = result[KEY_DEPTH];
            sbDepth.value = result[KEY_DEPTH];
            txtDepth.innerText = result[KEY_DEPTH];
        }

        bgPage.currentThemeID = result[KEY_THEME_ID];
    });
});

/* Add in default theme */

// var preSetThemes;
// var xhr = new XMLHttpRequest();
// xhr.onreadystatechange = function() {
//     if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
//         preSetThemes = JSON.parse(xhr.responseText);
//         var menu = document.getElementById("menuTheme");
//         var item;
//         for(var i in preSetThemes){
//             item = document.createElement("li");
//             item.innerText = i;
//             item.id = i;
//             item.addEventListener("click", changeTheme);
//             menu.appendChild(item);
//         }
//     }
// };
// xhr.open('GET', chrome.extension.getURL('preSetTheme.json'), true);
// xhr.send();

function changeTheme(ev){
    console.log("changeTheme=" + ev.target.id);
    saveToStorage(KEY_THEME_ID, ev.target.id);
    bgPage.currentThemeID = ev.target.id;

    chrome.tabs.query({status: "complete"}, function(tabs){
        console.log("changeTheme tabs.length=" + tabs.length);
        // var theme = preSetThemes[ev.target.id];
        for(var i=0;i<tabs.length;i++) {
            if(!tabs[i].url.startsWith("chrome://")){
                bgPage.insertCSS(tabs[i].id, bgPage.preSetThemes[bgPage.currentThemeID]);
                // chrome.tabs.insertCSS(tabs[i].id, {
                //     code: 'html.recolor-enabled, html.recolor-enabled > body, html.recolor-enabled > body > *, html.recolor-enabled *:not([aria-hidden=true]).withBgColor:not(.withBgImage) {background-color: ' + theme.bgColor + ' !important;}html.recolor-enabled * {color: ' + theme.textColor + ' !important;border-color: ' + theme.borderColor + ' !important;box-shadow: none !important;}html.recolor-enabled ::selection {background: rgba(142,142,142,0.3) !important;}html.recolor-enabled a:link {color: ' + theme.linkColor + ' !important;}html.recolor-enabled a:visited {color: ' + theme.visitedLinkColor + ' !important;}html.recolor-enabled img, html.recolor-enabled .withBgImage {background-color: rgba(0,0,0,0) !important;/*-webkit-filter: brightness(100%) contrast(100%) !important;*/}'
                // });
            }
        }
    });
}

// function insertCSS(tabId, theme){
//     if(theme != null){
//         chrome.tabs.insertCSS(tabId, {
//             code: 'html.recolor-enabled, html.recolor-enabled > body, html.recolor-enabled > body > *, html.recolor-enabled *:not([aria-hidden=true]).withBgColor:not(.withBgImage) {background-color: ' + theme.bgColor + ' !important;}html.recolor-enabled * {color: ' + theme.textColor + ' !important;border-color: ' + theme.borderColor + ' !important;box-shadow: none !important;}html.recolor-enabled ::selection {background: rgba(142,142,142,0.3) !important;}html.recolor-enabled a:link {color: ' + theme.linkColor + ' !important;}html.recolor-enabled a:visited {color: ' + theme.visitedLinkColor + ' !important;}html.recolor-enabled img, html.recolor-enabled .withBgImage {background-color: rgba(0,0,0,0) !important;/*-webkit-filter: brightness(100%) contrast(100%) !important;*/}'
//         });
//     }
// }

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log("received request tab.id=" + sender.tab.id + " currentThemeID=" + currentThemeID);
//         if(request.action == "injectCSS"){
//             if (sender.tab.id && sender.tab.id != chrome.tabs.TAB_ID_NONE) {
//                 insertCSS(request.tabId, preSetThemes[currentThemeID]);
//                 sendResponse({status: "ok2"});
//             } else {
//                 sendResponse({status: "tab.id does not available"});
//             }
//         }
//     }
// );

// chrome.tabs.onCreated.addListener(function(tab){
//      insertCSS(tab.id, preSetThemes[currentThemeID]);
// });
//
// chrome.tabs.onUpdated.addListener(function(tabsId, changeInfo, tab){
//     console.log("tabs.onUpdated tabsId=" + tabsId);
//      insertCSS(tabsId, preSetThemes[currentThemeID]);
// });
