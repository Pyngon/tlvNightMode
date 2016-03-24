var originalClass = document.documentElement.className;
var originalColor = document.documentElement.style.color;

document.documentElement.className += " recolor-enabled";
document.documentElement.style.color = "#ABB2BF";

chrome.storage.local.get("isEnabled", function(result){
    console.log("local.get=" + result["isEnabled"]);
    if(result["isEnabled"] == 0){
        document.documentElement.className = originalClass;
        document.documentElement.style.color = originalColor;
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
        sendResponse({status: "ok"});
    }
);
