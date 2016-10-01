var originalColor = document.documentElement.style.color;
// var originalWebkitFilter = document.documentElement.style.webkitFilter;
// document.documentElement.className += ' tlvNightModeOn';
document.documentElement.style.color = "#ABB2BF";

chrome.storage.local.get("isEnabled", function(result){
    if(result["isEnabled"] == 0){
        // document.documentElement.className = document.documentElement.className.replace(new RegExp('tlvNightModeOn', 'g'), '');
        document.documentElement.style.color = originalColor;
        // document.documentElement.style.webkitFilter = originalWebkitFilter;
    } else {

        chrome.storage.local.get("darkLoading", darkLoadingCallback);
        chrome.runtime.sendMessage({action: "injectCSS"}, function(response) {
            // Do nothing
        });
    }
});

chrome.storage.local.get("hideBgImage", function(result){
    if(result["hideBgImage"] != 0){
        document.documentElement.className += ' tlvHideBgImage';
    }
});

function darkLoadingCallback(result){
    if(result["darkLoading"] != 0){
        document.documentElement.style.webkitFilter = "brightness(60%)";
    }
}
