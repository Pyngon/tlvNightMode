// function insertCSS(tabId){
//     chrome.tabs.insertCSS(tabId, {
//         code: 'html.recolor-enabled, html.recolor-enabled > body, html.recolor-enabled > body > *, html.recolor-enabled *:not([aria-hidden=true]).withBgColor:not(.withBgImage) {background-color: rgba(127,0,0,1) !important;}html.recolor-enabled * {color: #7F6600 !important;border-color: #7F6600 !important;box-shadow: none !important;}html.recolor-enabled ::selection {background: rgba(142,142,142,0.3) !important;}}html.recolor-enabled img, html.recolor-enabled .withBgImage {background-color: rgba(0,0,0,0) !important;/*-webkit-filter: brightness(100%) contrast(100%) !important;*/}'
//     });
//     //code: 'html.recolor-enabled, html.recolor-enabled > body, html.recolor-enabled > body > *, html.recolor-enabled *:not([aria-hidden=true]).withBgColor:not(.withBgImage) {background-color: rgba(40,44,52,1) !important;}html.recolor-enabled * {olor: #ABB2BF !important;border-color: #464A54 !important;box-shadow: none !important;}html.recolor-enabled ::selection {background: rgba(142,142,142,0.3) !important;}}html.recolor-enabled img, html.recolor-enabled .withBgImage {background-color: rgba(0,0,0,0) !important;/*-webkit-filter: brightness(100%) contrast(100%) !important;*/}'
// }
//
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log("received request tab.id=" + sender.tab.id);
//         if(request.action == "injectCSS"){
//             if (sender.tab.id && sender.tab.id != chrome.tabs.TAB_ID_NONE) {
//                 insertCSS(request.tabId);
//                 sendResponse({status: "ok2"});
//             } else {
//                 sendResponse({status: "tab.id is not available"});
//             }
//         }
//     }
// );
