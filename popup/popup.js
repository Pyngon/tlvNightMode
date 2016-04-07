// var KEY_ENABLED = "isEnabled";
// var KEY_THEME_ID = "theme";
// var KEY_BRIGHTNESS = "brightness";
// var KEY_CONTRAST = "contrast";
// var KEY_DEPTH = "depth";
//
// var MIN_BRIGHTNESS = 0;
// var MAX_BRIGHTNESS = 200;
// var MIN_CONTRAST = 0;
// var MAX_CONTRAST = 200;
// var MIN_DEPTH = 0;
// var MAX_DEPTH = 0;
//
// var valueEnabled = true;
// var valueBrightness = 100;
// var valueContrast = 100;
// var valueDepth = 20;
// var currentThemeID = null;

var bgPage = chrome.extension.getBackgroundPage();

// function saveToStorage(key, value){
//     var obj = {};
//     obj[key] = value;
//     chrome.storage.local.set(obj);
// }

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

var brightnessTimer;
var timer = {};
/* page event */
document.addEventListener("DOMContentLoaded", function(){
    var menu = document.getElementById("menuTheme");
    var item;
    for(var i in bgPage.preSetThemes){
        item = renderThemeButton(i, bgPage.preSetThemes[i]);
        menu.appendChild(item);
    }

    var chkbOnOff = document.getElementById("chkbOnOff");
    if(bgPage.values[bgPage.KEY_ENABLED] != 0){
        chkbOnOff.checked = true;
    } else {
        chkbOnOff.checked = false;
    }
    chkbOnOff.addEventListener("change", function(ev){
        chrome.storage.local.get(bgPage.KEY_ENABLED, function(result){
            console.log("local.get=" + result[bgPage.KEY_ENABLED]);

            if(!ev.target.checked && result[bgPage.KEY_ENABLED] != 0){
                bgPage.saveValue(bgPage.KEY_ENABLED, 0);
                sendMessageToContentScript(false);
            } else if(ev.target.checked && result[bgPage.KEY_ENABLED] == 0){
                bgPage.saveValue(bgPage.KEY_ENABLED, 1);
                sendMessageToContentScript(true);
            }
        });
    });

    var sbBrightness = document.getElementById("sbBrightness");
    var txtBrightness = document.getElementById("txtBrightness");
    setupImageConfiguration(sbBrightness, txtBrightness, bgPage.KEY_BRIGHTNESS, bgPage.MIN_BRIGHTNESS, bgPage.MAX_BRIGHTNESS);
    // sbBrightness.value = bgPage.values[bgPage.KEY_BRIGHTNESS];
    // txtBrightness.value = bgPage.values[bgPage.KEY_BRIGHTNESS];
    // sbBrightness.addEventListener("input", function(ev){
    //     txtBrightness.value = ev.target.value;
    //
    //     changeImageConfiguration(bgPage.KEY_BRIGHTNESS, ev.target.value);
    //     // bgPage.saveValue(bgPage.KEY_BRIGHTNESS, ev.target.value);
    //     // chrome.tabs.query({active: true}, function(tabs){
    //     //     for(var i=0;i<tabs.length;i++) {
    //     //         chrome.tabs.insertCSS(tabs[i].id, {
    //     //             code: 'html.recolor-enabled img, html.recolor-enabled .withBgImage {-webkit-filter: brightness(' + bgPage.values[bgPage.KEY_BRIGHTNESS] + '%) contrast(' + bgPage.values[bgPage.KEY_CONTRAST] + '%) !important;}'
    //     //         });
    //     //     }
    //     // });
    // });
    // txtBrightness.addEventListener("input", function(ev){
    //     if(brightnessTimer){
    //         clearTimeout(brightnessTimer);
    //     }
    //     brightnessTimer = setTimeout(function(){
    //         var newValue = ev.target.value;
    //         if(newValue < bgPage.MIN_BRIGHTNESS){
    //             newValue = bgPage.MIN_BRIGHTNESS;
    //             txtBrightness.value = newValue;
    //         } else if(newValue > bgPage.MAX_BRIGHTNESS){
    //             newValue = bgPage.MAX_BRIGHTNESS;
    //             txtBrightness.value = newValue;
    //         }
    //         sbBrightness.value = newValue;
    //
    //         changeImageConfiguration(bgPage.KEY_BRIGHTNESS, newValue);
    //         // bgPage.saveValue(bgPage.KEY_BRIGHTNESS, newValue);
    //         // chrome.tabs.query({active: true}, function(tabs){
    //         //     for(var i=0;i<tabs.length;i++) {
    //         //         chrome.tabs.insertCSS(tabs[i].id, {
    //         //             code: 'html.recolor-enabled img, html.recolor-enabled .withBgImage {-webkit-filter: brightness(' + bgPage.values[bgPage.KEY_BRIGHTNESS] + '%) contrast(' + bgPage.values[bgPage.KEY_CONTRAST] + '%) !important;}'
    //         //         });
    //         //     }
    //         // });
    //     }, 1000);
    // });

    var sbContrast = document.getElementById("sbContrast");
    var txtContrast = document.getElementById("txtContrast");
    setupImageConfiguration(sbContrast, txtContrast, bgPage.KEY_CONTRAST, bgPage.MIN_CONTRAST, bgPage.MAX_CONTRAST);
    // sbContrast.value = bgPage.values[bgPage.KEY_CONTRAST];
    // txtContrast.value = bgPage.values[bgPage.KEY_CONTRAST];
    // sbContrast.addEventListener("input", function(ev){
    //     txtContrast.value = ev.target.value;
    //     valueContrast = ev.target.value;
    //     bgPage.saveValue(bgPage.KEY_CONTRAST, valueContrast);
    //
    //     chrome.tabs.query({active: true}, function(tabs){
    //         for(var i=0;i<tabs.length;i++) {
    //             chrome.tabs.insertCSS(tabs[i].id, {
    //                 code: 'html.recolor-enabled img, html.recolor-enabled .withBgImage {-webkit-filter: brightness(' + bgPage.values[bgPage.KEY_BRIGHTNESS] + '%) contrast(' + valueContrast + '%) !important;}'
    //             });
    //         }
    //     });
    // });

    var sbDepth = document.getElementById("sbDepth");
    var txtDepth = document.getElementById("txtDepth");
    sbDepth.value = bgPage.values[bgPage.KEY_DEPTH];
    txtDepth.value = bgPage.values[bgPage.KEY_DEPTH];

    sbDepth.addEventListener("input", function(ev){
        txtDepth.value = ev.target.value;
        // valueDepth = ev.target.value;
        bgPage.saveValue(bgPage.KEY_DEPTH, ev.target.value);
    });
    txtDepth.addEventListener("input", function(ev){
        if(timer[bgPage.KEY_DEPTH]){
            clearTimeout(timer[bgPage.KEY_DEPTH]);
        }
        timer[bgPage.KEY_DEPTH] = setTimeout(function(){
            var newValue = ev.target.value;
            if(newValue < bgPage.MIN_DEPTH){
                newValue = bgPage.MIN_DEPTH;
                txtDepth.value = newValue;
            } else if(newValue > bgPage.MAX_DEPTH){
                newValue = bgPage.MAX_DEPTH;
                txtDepth.value = newValue;
            }
            sbDepth.value = newValue;
            bgPage.saveValue(bgPage.KEY_DEPTH, ev.target.value);
        }, 500);
    });

    var linkAdvance = document.getElementById("linkAdvance");
    linkAdvance.addEventListener("click", function(ev){
        console.log(ev.target.innerText);
        var blockAdvance = document.getElementById("blockAdvance");
        if(blockAdvance.style.display != "none"){
            blockAdvance.style.display = "none";
            ev.target.innerText = "Show Advance Settings"
        } else {
            blockAdvance.style.display = "block";
            ev.target.innerText = "Hide Advance Settings"
        }
    });

    // chrome.storage.local.get([bgPage.KEY_BRIGHTNESS, bgPage.KEY_CONTRAST, bgPage.KEY_ENABLED, bgPage.KEY_DEPTH, bgPage.KEY_THEME_ID], function(result){
    //     if(result[bgPage.KEY_ENABLED] != 0){
    //         // btnEnable.innerHTML = "Enabled";
    //         chkbOnOff.checked = true;
    //     } else {
    //         // btnEnable.innerHTML = "Disabled";
    //         chkbOnOff.checked = false;
    //     }
    //
    //     if(result[bgPage.KEY_BRIGHTNESS] != null){
    //         valueBrightness = result[bgPage.KEY_BRIGHTNESS];
    //         sbBrightness.value = result[bgPage.KEY_BRIGHTNESS];
    //         txtBrightness.value = result[bgPage.KEY_BRIGHTNESS];
    //     }
    //
    //     if(result[bgPage.KEY_CONTRAST] != null){
    //         valueContrast = result[bgPage.KEY_CONTRAST];
    //         sbContrast.value = result[bgPage.KEY_CONTRAST];
    //         txtContrast.value = result[bgPage.KEY_CONTRAST];
    //     }
    //
    //     if(result[bgPage.KEY_DEPTH] != null){
    //         valueContrast = result[bgPage.KEY_DEPTH];
    //         sbDepth.value = result[bgPage.KEY_DEPTH];
    //         txtDepth.value = result[bgPage.KEY_DEPTH];
    //     }
    //
    //     bgPage.currentThemeID = result[bgPage.KEY_THEME_ID];
    // });
});

function setupImageConfiguration(slidebar, textbox, key, minValue, maxValue){
    slidebar.value = bgPage.values[key];
    textbox.value = bgPage.values[key];

    slidebar.addEventListener("input", function(ev){
        textbox.value = ev.target.value;
        changeImageConfiguration(key, ev.target.value);
    });
    textbox.addEventListener("input", function(ev){
        if(timer[key]){
            clearTimeout(timer[key]);
        }
        timer[key] = setTimeout(function(){
            var newValue = ev.target.value;
            if(newValue < minValue){
                newValue = minValue;
                textbox.value = newValue;
            } else if(newValue > maxValue){
                newValue = maxValue;
                textbox.value = newValue;
            }
            slidebar.value = newValue;

            changeImageConfiguration(key, newValue);
        }, 500);
    });
}

function changeImageConfiguration(key, newValue){
    bgPage.saveValue(key, newValue);
    chrome.tabs.query({active: true}, function(tabs){
        for(var i=0;i<tabs.length;i++) {
            chrome.tabs.insertCSS(tabs[i].id, {
                code: 'html.recolor-enabled img, html.recolor-enabled .withBgImage {-webkit-filter: brightness(' + bgPage.values[bgPage.KEY_BRIGHTNESS] + '%) contrast(' + bgPage.values[bgPage.KEY_CONTRAST] + '%) !important;}'
            });
        }
    });
}

function renderThemeButton(name, theme){
    var themeContentDiv = document.createElement("div");
    themeContentDiv.className = "themeContent";
    themeContentDiv.style = "border-color: " + theme.borderColor + "; background-color: " + theme.bgColor + ";";
    // themeContentDiv.innerText = "A";
    themeContentDiv.id = name;
    themeContentDiv.addEventListener("click", changeTheme);

    var textSpan = document.createElement("span");
    textSpan.style = "color: " + theme.textColor + ";";
    textSpan.innerText = "T";

    var linkSpan = document.createElement("span");
    linkSpan.style = "color: " + theme.linkColor + ";";
    linkSpan.innerText = "L";

    var visitedSpan = document.createElement("span");
    visitedSpan.style = "color: " + theme.visitedLinkColor + ";";
    visitedSpan.innerText = "V";

    themeContentDiv.appendChild(textSpan);
    themeContentDiv.appendChild(linkSpan);
    themeContentDiv.appendChild(visitedSpan);

    var nameSpan = document.createElement("span");
    nameSpan.className = "themeName";
    nameSpan.innerText = name;

    var themeBlockDiv = document.createElement("div");
    themeBlockDiv.className = "themeBlock";
    themeBlockDiv.appendChild(themeContentDiv);
    themeBlockDiv.appendChild(nameSpan);

    var item = document.createElement("li");
    item.appendChild(themeBlockDiv);

    return item;
}

function changeTheme(ev){
    console.log("changeTheme target=" + ev.target);
    console.log("changeTheme=" + ev.target.id);
    bgPage.saveValue(bgPage.KEY_THEME_ID, ev.target.id);
    bgPage.currentThemeID = ev.target.id;

    chrome.tabs.query({status: "complete"}, function(tabs){
        console.log("changeTheme tabs.length=" + tabs.length);
        for(var i=0;i<tabs.length;i++) {
            if(!tabs[i].url.startsWith("chrome://")){
                bgPage.insertCSS(tabs[i].id, bgPage.preSetThemes[bgPage.currentThemeID]);

            }
        }
    });
}
