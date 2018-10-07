var originalColor = document.documentElement.style.color;
document.documentElement.style.color = "#ABB2BF";

chrome.runtime.sendMessage({action: "isChangeColor"}, function(response) {
    if(response.data == false) {
        document.documentElement.style.color = originalColor;
    } else {
        chrome.storage.local.get("darkLoading", darkLoadingCallback);
    }
});

chrome.storage.local.get("hideBgImage", function(result){
    if(result["hideBgImage"] != 0){
        document.documentElement.className += ' tlvHideBgImage';
    }
});

function darkLoadingCallback(result){
    if(result["darkLoading"] != 0){
        document.documentElement.style.webkitFilter = "brightness(30%)";
    }
}
