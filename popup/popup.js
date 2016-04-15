var bgPage = chrome.extension.getBackgroundPage();
var timer = {};
var contextMenuId = "";

/* page event */
document.addEventListener("DOMContentLoaded", function(){
    var item;

    /* init pre-set theme */
    var menu = document.getElementById("menuTheme");
    for(var i in bgPage.preSetThemes){
        item = renderThemeButton(i, bgPage.preSetThemes[i]);
        menu.appendChild(item);
    }

    /* init custom themes */
    var customThemesMenu = document.getElementById("menuCustomTheme");
    for(var i in bgPage.customThemes){
        console.log("custom Theme=" + i + ", bgColor=" + bgPage.customThemes[i].bgColor);
        item = renderThemeButton(i, bgPage.customThemes[i]);
        item.addEventListener("contextmenu", customThemeRightClick);
        customThemesMenu.appendChild(item);
    }

    var btnCreateTheme = document.getElementById("btnCreateTheme");
    btnCreateTheme.addEventListener("click", function(ev){
        window.location.href = "./createTheme.html";
    });

    var customEdit = document.getElementById("customThemeEdit");
    customEdit.addEventListener("click", function(ev){
        console.log("customEdit");
        if(contextMenuId && contextMenuId.length > 0){
            window.location.href = "./createTheme.html?id=" + contextMenuId;
        }
    });

    var customDelete = document.getElementById("customThemeDelete");
    customDelete.addEventListener("click", function(ev){
        console.log("customDelete");
        if(contextMenuId && contextMenuId.length > 0){
            var menuCustomTheme = document.getElementById("menuCustomTheme");
            var menuItem = document.getElementById(contextMenuId);
            menuCustomTheme.removeChild(menuItem);

            bgPage.deleteTheme(contextMenuId);
        }
    });

    /* init on off button */
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
                sendMessageToContentScript("isEnable", false);
            } else if(ev.target.checked && result[bgPage.KEY_ENABLED] == 0){
                bgPage.saveValue(bgPage.KEY_ENABLED, 1);
                sendMessageToContentScript("isEnable", true);
            }
        });
    });

    /* init image configuration */
    var sbBrightness = document.getElementById("sbBrightness");
    var txtBrightness = document.getElementById("txtBrightness");
    setupImageConfiguration(sbBrightness, txtBrightness, bgPage.KEY_BRIGHTNESS, bgPage.MIN_BRIGHTNESS, bgPage.MAX_BRIGHTNESS);

    var sbContrast = document.getElementById("sbContrast");
    var txtContrast = document.getElementById("txtContrast");
    setupImageConfiguration(sbContrast, txtContrast, bgPage.KEY_CONTRAST, bgPage.MIN_CONTRAST, bgPage.MAX_CONTRAST);

    /* init advance settings */
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

    var chkbDarkStart = document.getElementById("chkbDarkStart");
    if(bgPage.values[bgPage.KEY_DARK_LOADING] != 0){
        chkbDarkStart.checked = true;
    } else {
        chkbDarkStart.checked = false;
    }
    chkbDarkStart.addEventListener("change", function(ev){
        if(ev.target.checked){
            bgPage.saveValue(bgPage.KEY_DARK_LOADING, 1);
        } else {
            bgPage.saveValue(bgPage.KEY_DARK_LOADING, 0);
        }
    });

    var chkbHideBgImage = document.getElementById("chkbHideBgImage");
    if(bgPage.values[bgPage.KEY_HIDE_BGIAMGE] == 1){
        chkbHideBgImage.checked = true;
    } else {
        chkbHideBgImage.checked = false;
    }
    chkbHideBgImage.addEventListener("change", function(ev){
        if(ev.target.checked){
            bgPage.saveValue(bgPage.KEY_HIDE_BGIAMGE, 1);
            sendMessageToContentScript("isHideBgImage", true);
        } else {
            bgPage.saveValue(bgPage.KEY_HIDE_BGIAMGE, 0);
            sendMessageToContentScript("isHideBgImage", false);
        }
    });

    var linkAdvance = document.getElementById("linkAdvance");
    linkAdvance.addEventListener("click", function(ev){
        console.log(ev.target.innerText);
        var blockAdvance = document.getElementById("blockAdvance");
        if(blockAdvance.style.display == "none"){
            blockAdvance.style.display = "block";
            ev.target.style.display = "none";
        }
    });

});

document.documentElement.addEventListener("click", function(ev){
    var menu = document.getElementById("customThemeRightClick");
    if(menu && menu.style.display != "none") {
        menu.style.display = "none";
    }
});

/**
 * Send message to content scripts in all tabs when turning on or off this extension.
 * @param isEnabled - true if turning on this extension, false otherwise
 */
function sendMessageToContentScript(key, value){
    chrome.tabs.query({status: "complete"}, function(tabs){
        console.log("tabs.length=" + tabs.length);
        for(var i=0;i<tabs.length;i++) {
            var obj = {};
            obj[key] = value;
            chrome.tabs.sendMessage(tabs[i].id, obj, function(response){
                console.log("contentScript is done.");
            });
        }
    });
}

/**
 * Setup listener for the slidebar and textbox for image configuration.
 * This function is mainly to avoid writing duplicate code for Contrast and Brightness,
 * since both of them share similar configuration setup.
 * @param slidebar - input HTMLElement with type range.
 * @param textbox - input HTMLElement with type text.
 * @param key - The key of this image configuration, see background.js.
 * @param minValue - The minimum value of the range.
 * @param maxValue - the maximum value of the range.
 */
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

/**
 * Insert CSS to current tab when user is changing the configuration.
 * @param key - the key of the property that user is changing.
 * @param newValue - The new value of the property.
 */
function changeImageConfiguration(key, newValue){
    bgPage.saveValue(key, newValue);
    chrome.tabs.query({active: true}, function(tabs){
        for(var i=0;i<tabs.length;i++) {
            chrome.tabs.insertCSS(tabs[i].id, {
                code: 'html.tlvNightModeOn img, html.tlvNightModeOn .withBgImage {-webkit-filter: brightness(' + bgPage.values[bgPage.KEY_BRIGHTNESS] + '%) contrast(' + bgPage.values[bgPage.KEY_CONTRAST] + '%) !important;}'
            });
        }
    });
    bgPage.insertImageConfigToAll();
}

function renderThemeButton(id, theme){
    var themeContentDiv = document.createElement("div");
    themeContentDiv.className = "themeContent";
    themeContentDiv.style = "border-color: " + theme.borderColor + "; background-color: " + theme.bgColor + ";";

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
    nameSpan.innerText = theme.name;
    nameSpan.style = "overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:inherit;display:inline-block;";

    var themeBlockDiv = document.createElement("div");
    themeBlockDiv.className = "themeBlock";
    themeBlockDiv.title = theme.name;
    themeBlockDiv.appendChild(themeContentDiv);
    themeBlockDiv.appendChild(nameSpan);

    var item = document.createElement("li");
    item.id = id;
    item.addEventListener("click", changeTheme);
    item.appendChild(themeBlockDiv);

    return item;
}

/**
 * Listener of theme button, it will apply the theme to all complete loading tabs.
 * @param ev - click event
 */
function changeTheme(ev){
    console.log("changeTheme target=" + this);
    console.log("changeTheme=" + this.id);
    bgPage.saveValue(bgPage.KEY_THEME_ID, this.id);
    bgPage.currentThemeID = this.id;

    chrome.tabs.query({status: "complete"}, function(tabs){
        console.log("changeTheme tabs.length=" + tabs.length);
        for(var i=0;i<tabs.length;i++) {
            if(!tabs[i].url.startsWith("chrome://")){
                bgPage.insertCSS(tabs[i].id, bgPage.getTheme(bgPage.currentThemeID));
            }
        }
    });
}

/**
 * Event Listener for right-click on custom theme. It will show a context menu.
 * User can delete or edit the theme from this context menu.
 */
function customThemeRightClick(ev){
    console.log("capture right click x=" + ev.clientX + " y=" + ev.clientY);
    ev.preventDefault();

    var menu = document.getElementById("customThemeRightClick");
    menu.style.left = ev.clientX + "px";
    menu.style.top = ev.clientY + "px";
    menu.style.display = "block";

    contextMenuId = this.id;

    return false;
}
