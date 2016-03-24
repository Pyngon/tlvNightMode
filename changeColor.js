var pyngon = pyngon || {};

pyngon.webColor = (function(){
    var originalDocumentClass;
    var newStyleElement;

    return {
        execute: function(node) {
            // originalDocumentClass = document.documentElement.className;
            // chrome.storage.local.get("isEnabled", function(result){
            //     console.log("local.get=" + result["isEnabled"]);
            //     if(result["isEnabled"] != 0){
            //         document.documentElement.className += " recolor-enabled";
            //     }
            // });

            newStyleElement = document.createElement("style");
            newStyleElement.id = "web-color-style";

            newStyleElement.appendChild(document.createTextNode("html.recolor-enabled, html.recolor-enabled *:not([aria-hidden=true]).withBgColor:not(.withBgImage) {background-color: rgba(40,44,52,1) !important;} "));
            // newStyleElement.appendChild(document.createTextNode("html.recolor-enabled * {color: #ABB2BF !important; border-color: #464A54 !important; box-shadow: none !important;} "));
            // newStyleElement.appendChild(document.createTextNode("html.recolor-enabled ::selection {background: rgba(142,142,142,0.3) !important;} "));
            // newStyleElement.appendChild(document.createTextNode("html.recolor-enabled ::selection {background: rgba(142,142,142,0.3) !important;} "));
            // newStyleElement.appendChild(document.createTextNode("html.recolor-enabled a:link {color: #769EC1 !important;} "));
            // newStyleElement.appendChild(document.createTextNode("html.recolor-enabled a:visited {color: #C18176 !important;} "));
            // newStyleElement.appendChild(document.createTextNode("html.recolor-enabled img, html.recolor-enabled .withBgImage {background-color: rgba(0,0,0,0); -webkit-filter: brightness(80%) contrast(120%) !important;} "));

            document.head.appendChild(newStyleElement);
        },

        // disable: function(){
        //     document.documentElement.className = originalDocumentClass;
        // },
        //
        // enable: function(){
        //     document.documentElement.className += " recolor-enabled";
        // },

        traceDOM: function(node){

            if(node.nodeType == Node.ELEMENT_NODE){
                var computedStyle = window.getComputedStyle(node);
                if(computedStyle != null && computedStyle.backgroundImage != "none"){
                    node.className += " withBgImage";
                }
                if(node.parentNode != document.body){
                    var color = parseColor(computedStyle.backgroundColor);
                    if(computedStyle && (!color[3] || color[3] != 1)){
                        node.className += " noBgColor";
                    } else {
                        node.className += " withBgColor";
                    }
                }

            }

            var childNodes = node.childNodes;
            for(var i=0;i<childNodes.length;i++){
                this.traceDOM(childNodes[i]);
            }

        },

        printStyleSheet: function(){
            for(var i=0;i<document.styleSheets.length;i++){
                // console.log(document.styleSheets[i]);
                if(document.styleSheets[i].cssRules){
                    for(var j=0;j<document.styleSheets[i].cssRules.length;j++){
                        console.log("i=" + i + ", j=" + j);
                        console.log(document.styleSheets[i].cssRules[j].selectorText);
                        break;
                    }
                }
            }
        }
    };

})();
console.log("changeColor.js");
pyngon.webColor.traceDOM(document.body);
pyngon.webColor.execute(document.body);

// pyngon.webColor.printStyleSheet();
//console.log(window.getComputedStyle(document.body));

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log("received request=" + request.isEnable);
//         if (request.isEnable) {
//             pyngon.webColor.enable();
//         } else {
//             pyngon.webColor.disable();
//         }
//         sendResponse({status: "ok"});
//     });

// var domMutationObserver = new MutationObserver(function(records){
//     console.log("new mutation");
//     for(var i=0;i<records.length;i++){
//         // if(records[i].type == "attributes"){
//         //     console.log("mutation type=" + records[i].type + ", attributeName=" + records[i].attributeName + ", oldValue=" + records[i].oldValue + ", newValue=" + records[i].target[records[i].attributeName]);
//         // } else if (records[i].type == "childList"){
//         //     console.log("mutation type=" + records[i].type + ", target=" + records[i].target.tagName);
//         //     for(var j=0;j<records[i].addedNodes.length;j++){
//         //         console.log("mutation addedNodes[" + j + "]=" + records[i].addedNodes[j].tagName);
//         //     }
//         // }
//         if (records[i].type == "childList"){
//             for(var j=0;j<records[i].addedNodes.length;j++){
//                 if(records[i].addedNodes[j].tagName && records[i].addedNodes[j].tagName.toLowerCase() == "body"){
//                     console.log("get body");
//                     observeBody(records[i].addedNodes[j]);
//                     domMutationObserver.disconnect();
//                     break;
//                 }
//             }
//         }
//     }
// });
// var observerInit = {childList: true};
// domMutationObserver.observe(document.documentElement, observerInit);

observeBody(document.body);
function observeBody(body){
    var bodyMutationObserver = new MutationObserver(function(records){
        console.log("body mutation");
        for(var i=0;i<records.length;i++){
            if(records[i].type == "attributes"){
                console.log("mutation type=" + records[i].type + ", attributeName=" + records[i].attributeName + ", oldValue=" + records[i].oldValue + ", newValue=" + records[i].target.getAttribute(records[i].attributeName));
                analyzeAndModifyNode(records[i].target, false);
            } else if (records[i].type == "childList"){
                console.log("mutation type=" + records[i].type + ", target=" + records[i].target.tagName + ", target.className=" + records[i].target.className + ", target.id=" + records[i].target.id);
                for(var j=0;j<records[i].addedNodes.length;j++){
                    console.log("mutation addedNodes[" + j + "]=" + records[i].addedNodes[j].tagName);
                    analyzeAndModifyNode(records[i].addedNodes[j], true);
                }
            } else {
                console.log("unknown type=" + records[i].type);
            }

        }
    });
    var bodyInit = {childList: true, attributes: true, subtree: true, attributeOldValue: true};
    bodyMutationObserver.observe(body, bodyInit);
}

function analyzeAndModifyNode(node, checkChild){
    if(node.nodeType == Node.ELEMENT_NODE){

        console.log("analyzeAndModifyNode");
        // if(node.id == "globalContainer"){
        //     console.log("id=globalContainer");
        // }

        var computedStyle = window.getComputedStyle(node);
        // console.log("tagName=" + node.tagName + ", classname=" + node.className + ", backgroundImage=" + window.getComputedStyle(node).backgroundImage + ", color=" + computedStyle.backgroundColor);
        // if(node.tagName && node.tagName == "DIV" && node.className.includes("_4lqu")){
        //     console.log("tagName=" + node.tagName + ", classname=" + node.className + ", backgroundColor=" + window.getComputedStyle(node).backgroundImage + "");
        // }
        if(!node.className.includes("withBgImage")){
            if(computedStyle != null && computedStyle.backgroundImage != "none"){
                // console.log("tag=" + node.tagName + ", window.getComputedStyle(node).backgroundImage=" + window.getComputedStyle(node).backgroundImage);
                node.className += " withBgImage";
                return;
            }

        }

        if(node.parentNode && node.parentNode.tagName && node.parentNode.tagName.toLowerCase() != "body"){
            console.log("color=" + computedStyle.backgroundColor);
            var color = parseColor(computedStyle.backgroundColor);
            // console.log("parsed color=" + color);
            if(computedStyle && (!color[3] || color[3] != 1)){
                console.log("tag=" + node.parentNode.tagName + ", noBgColor=" + computedStyle.backgroundColor);
                //console.log("set color");
                if(!node.className.includes("noBgColor")){
                    node.className += " noBgColor";
                }
            } else {
                if(!node.className.includes("withBgColor")){
                    console.log("tag=" + node.parentNode.tagName + ", withBgColor=" + computedStyle.backgroundColor);
                    node.className += " withBgColor";
                }
            }
        } else {
            console.log("parent node=" + node.parentNode.tagName);
        }


    }
    if(checkChild){
        var childNodes = node.childNodes;
        console.log("childNode.length=" + childNodes.length);
        for(var i=0;i<childNodes.length;i++){
            analyzeAndModifyNode(childNodes[i], checkChild);
        }
    }

}

/**!
 * @preserve $.parseColor
 * Copyright 2011 THEtheChad Elliott
 * Released under the MIT and GPL licenses.
 */

// Parse hex/rgb{a} color syntax.
// @input string
// @returns array [r,g,b{,o}]
function parseColor(color) {

    var cache
      , p = parseInt // Use p as a byte saving reference to parseInt
      , color = color.replace(/\s\s*/g,'') // Remove all spaces
    ;//var

    // Checks for 6 digit hex and converts string to integer
    if (cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color))
        cache = [p(cache[1], 16), p(cache[2], 16), p(cache[3], 16)];

    // Checks for 3 digit hex and converts string to integer
    else if (cache = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color))
        cache = [p(cache[1], 16) * 17, p(cache[2], 16) * 17, p(cache[3], 16) * 17];

    // Checks for rgba and converts string to
    // integer/float using unary + operator to save bytes
    else if (cache = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color))
        cache = [+cache[1], +cache[2], +cache[3], +cache[4]];

    // Checks for rgb and converts string to
    // integer/float using unary + operator to save bytes
    else if (cache = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color))
        cache = [+cache[1], +cache[2], +cache[3]];

    // Otherwise throw an exception to make debugging easier
    else throw Error(color + ' is not supported by $.parseColor');

    // Performs RGBA conversion by default
    isNaN(cache[3]) && (cache[3] = 1);

    // Adds or removes 4th value based on rgba support
    // Support is flipped twice to prevent erros if
    // it's not defined
    return cache.slice(0,4);
}
