var bgPage = chrome.extension.getBackgroundPage();
var DEBUG = bgPage.DEBUG;

/* page event */
document.addEventListener("DOMContentLoaded", function() {
    /* init whitelist options */
    var radExclude = document.getElementById("radExclude");
    var radInclude = document.getElementById("radInclude");
    var option = bgPage.values[bgPage.KEY_WHITELIST_OPTIONS];
    if(option == 0) {
        radExclude.checked = true;
    } else {   
        radInclude.checked = true;
    }
    radExclude.addEventListener("change", function(ev) {
        if(DEBUG) console.log("radExclude change");
        if(ev.target.checked) {
            bgPage.saveValue(bgPage.KEY_WHITELIST_OPTIONS, ev.target.value);
        }
    });
    radInclude.addEventListener("change", function(ev) {
        if(DEBUG) console.log("radInclude change");
        if(ev.target.checked) {
            bgPage.saveValue(bgPage.KEY_WHITELIST_OPTIONS, ev.target.value);
        }
    });

    /* init back button */
    var btnBack = document.getElementById("btnBack");
    btnBack.addEventListener("click", function(ev) {
        window.location.href = "../popup.html";
    });

});