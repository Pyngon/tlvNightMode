var originalClass = document.documentElement.className;
var originalColor = document.documentElement.style.color;
var originalWebkitFilter = document.documentElement.style.webkitFilter;

document.documentElement.className += " recolor-enabled";
document.documentElement.style.color = "#ABB2BF";
document.documentElement.style.webkitFilter = "brightness(40%)";

chrome.storage.local.get("isEnabled", function(result){
    console.log("local.get=" + result["isEnabled"]);
    if(result["isEnabled"] == 0){
        document.documentElement.className = originalClass;
        document.documentElement.style.color = originalColor;
        document.documentElement.style.webkitFilter = originalWebkitFilter;
    } else {
        chrome.runtime.sendMessage({action: "injectCSS"}, function(response) {
            console.log(response.status);
        });
    }
});

function disable(){
    document.documentElement.className = originalClass;
}

function enable(){
    document.documentElement.className += " recolor-enabled";
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("received request=" + request.isEnable);
        if (request.isEnable) {
            enable();
        } else {
            disable();
        }
        sendResponse({status: "ok1"});
    }
);
