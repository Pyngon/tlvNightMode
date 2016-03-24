var KEY_ENABLED = "isEnabled";

function enableFunction(evt){
    // var isEnabled = localStorage.getItem("isEnabled");
    // if(isEnabled != 0){
    //     localStorage.setItem("isEnabled", 0);
    //     evt.target.innerHTML = "Disabled";
    //     sendMessageToContentScript(false);
    // } else {
    //     localStorage.setItem("isEnabled", 1);
    //     evt.target.innerHTML = "Enabled";
    //     sendMessageToContentScript(true);
    // }

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
