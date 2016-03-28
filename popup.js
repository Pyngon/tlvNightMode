var KEY_ENABLED = "isEnabled";
var KEY_THEME = "theme";

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

document.addEventListener("DOMContentLoaded", function(){
    var btnEnable = document.getElementById("btnEnable");

    var isEnabled = localStorage.getItem("isEnabled");
    if(isEnabled != false){
        btnEnable.innerHTML = "Enabled";
    } else {
        btnEnable.innerHTML = "Disabled";
    }

    btnEnable.addEventListener("click", enableFunction);
});


var preSetThemes;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
        preSetThemes = JSON.parse(xhr.responseText);
        var menu = document.getElementById("menuTheme");
        var item;
        for(var i in preSetThemes){
            item = document.createElement("li");
            item.innerText = i;
            item.id = i;
            item.addEventListener("click", changeTheme);
            menu.appendChild(item);
        }
    }
};
xhr.open('GET', chrome.extension.getURL('preSetTheme.json'), true);
xhr.send();

function changeTheme(ev){
    console.log("changeTheme=" + ev.target.id);
    saveToStorage(KEY_THEME, ev.target.id);

    chrome.tabs.query({active: true}, function(tabs){
        console.log("changeTheme tabs.length=" + tabs.length);
        var theme = preSetThemes[ev.target.id];
        for(var i=0;i<tabs.length;i++) {
            chrome.tabs.insertCSS(tabs[i].id, {
                code: 'html.recolor-enabled, html.recolor-enabled > body, html.recolor-enabled > body > *, html.recolor-enabled *:not([aria-hidden=true]).withBgColor:not(.withBgImage) {background-color: ' + theme.bgColor + ' !important;}html.recolor-enabled * {color: ' + theme.textColor + ' !important;border-color: ' + theme.borderColor + ' !important;box-shadow: none !important;}html.recolor-enabled ::selection {background: rgba(142,142,142,0.3) !important;}html.recolor-enabled a:link {color: ' + theme.linkColor + ' !important;}html.recolor-enabled a:visited {color: ' + theme.visitedLinkColor + ' !important;}html.recolor-enabled img, html.recolor-enabled .withBgImage {background-color: rgba(0,0,0,0) !important;/*-webkit-filter: brightness(100%) contrast(100%) !important;*/}'
            });
        }
    });
}
