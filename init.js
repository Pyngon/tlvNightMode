// var originalClass = document.documentElement.className;
var originalColor = document.documentElement.style.color;
var originalWebkitFilter = document.documentElement.style.webkitFilter;

document.documentElement.className += ' tlvNightModeOn';
document.documentElement.style.color = "#ABB2BF";
document.documentElement.style.webkitFilter = "brightness(40%)";

chrome.storage.local.get("isEnabled", function(result){
    console.log("local.get=" + result["isEnabled"]);
    if(result["isEnabled"] == 0){
        // document.documentElement.className = originalClass;
        document.documentElement.className = document.documentElement.className.replace(new RegExp(' tlvNightModeOn', 'g'), '');
        document.documentElement.style.color = originalColor;
        document.documentElement.style.webkitFilter = originalWebkitFilter;
    } else {
        chrome.runtime.sendMessage({action: "injectCSS"}, function(response) {
            console.log(response.status);
        });
    }
});

// chrome.runtime.sendMessage({action: "injectCSS"}, function(response){
//     console.log("injectCSS response=" + Object.keys(response));
// });


// function disable(){
//     document.documentElement.className = originalClass;
// }
//
// function enable(){
//     document.documentElement.className += " tlvNightModeOn";
// }
//
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log("received request=" + request.isEnable);
//         if (request.isEnable) {
//             enable();
//         } else {
//             disable();
//         }
//         sendResponse({status: "ok1"});
//     }
// );
