console.log("changeColor.js");
console.log("window width=" + window.innerWidth + ", height=" + window.innerHeight);
// var myOriginalClass;
// if(typeof originalClass !== "undefined"){
//     /* init.js is not injected */
//     console.log("originalClass exist");
//     myOriginalClass = originalClass;
// } else {
//     console.log("originalClass doesn't exist");
//     myOriginalClass = document.documentElement.className;
// }

chrome.storage.local.get("isEnabled", function(result){
    console.log("local.get=" + result["isEnabled"]);
    if(result["isEnabled"] != 0 && !document.documentElement.className.includes("tlvNightModeOn")){
        document.documentElement.className += " tlvNightModeOn";
    }
});

function disable(){
    // document.documentElement.className = myOriginalClass;
    console.log("disable className=" + document.documentElement.className);
    document.documentElement.className = document.documentElement.className.replace(new RegExp('tlvNightModeOn', 'g'), '');
}

function enable(){
    document.documentElement.className += " tlvNightModeOn";
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

var pyngon = pyngon || {};

pyngon.webColor = (function(){
    var originalDocumentClass;
    var newStyleElement;

    return {
        traceDOM: function(node){

            if(node.nodeType == Node.ELEMENT_NODE){
                // console.log("traceDOM tag=" + node.tagName + ", class=" + node.className + ", id=" + node.id);
                // var computedStyle = window.getComputedStyle(node);
                // if(node.className.includes("wq")){
                //     console.log("found wq");
                //     console.log("class wq width=" + node.offsetWidth + ", height=" + node.offsetHeight + " computedStyle.backgroundImage=" + computedStyle.backgroundImage);
                // }
                // if(computedStyle != null && computedStyle.backgroundImage != "none"){
                //     node.className += " withBgImage";
                // }
                //
                // // if(node.offsetWidth/window.innerWidth > 0.6){
                // //     console.log("found full screen image");
                // //     node.className += " fullscreenBgImage";
                // // }
                //
                // if(node.parentNode != document.body){
                //     var color = parseColor(computedStyle.backgroundColor);
                //     if(computedStyle && (!color[3] || color[3] != 1)){
                //         node.className += " noBgColor";
                //     } else {
                //         node.className += " withBgColor";
                //     }
                // }
                tagElement(node);
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

var startDelay = setTimeout(delayFunction,1500);

function delayFunction(){
    pyngon.webColor.traceDOM(document.body);
    observeBody(document.body);
}

var maxDepth = 25;

function observeBody(body){
    var bodyMutationObserver = new MutationObserver(function(records){
        chrome.storage.local.get("depth", function(result){
            if(result){
                console.log("depth result=" + result["depth"]);
                maxDepth = result["depth"];
            }
            for(var i=0;i<records.length;i++){
                if (records[i].type == "childList"){
                    for(var j=0;j<records[i].addedNodes.length;j++){
                        analyzeAndModifyNode(records[i].addedNodes[j], true, 0);
                    }
                }
                // else if(records[i].type == "attributes"){
                //     console.log("mutation observer style changed class=" + records[i].target.className + " oldValue=" + records[i].oldValue + ", newValue=" + records[i].target.style.cssText);
                //     if(records[i].target.style.cssText.includes("background-color") || records[i].target.style.cssText.includes("background-image")){
                //         analyzeAndModifyNode(records[i].target, false, 0);
                //     }
                // }
            }

        });

    });

    var bodyInit = {childList: true, subtree: true}; // , attributes: true, attributeOldValue: true, attributeFilter: ["style", "class"]
    bodyMutationObserver.observe(body, bodyInit);
}

function analyzeAndModifyNode(node, checkChild, depth){
    if(maxDepth && maxDepth > 0 && depth > maxDepth){
        return;
    }

    if(node && (!node.className || (!node.className.includes("noBgColor") && !node.className.includes("withBgColor") && !node.className.includes("withBgImage")))) {

        if(node.nodeType == Node.ELEMENT_NODE){
            // console.log("analyzeAndModifyNode tag=" + node.tagName + ", class=" + node.className + ", id=" + node.id);
            // if(node.className.includes("wl")){
            //     console.log("found wl");
            //     console.log("class wl widht=" + node.offsetWidth + ", heigth=" + node.offsetHeight);
            // }
            //
            // var computedStyle = window.getComputedStyle(node);
            // if(!node.className.includes("withBgImage") || !node.className.includes("fullscreenBgImage")){
            //     if(computedStyle != null && computedStyle.backgroundImage != "none"){
            //         // if(node.offsetWidth/window.innerWidth > 0.6){
            //         //     console.log("found full screen image");
            //         //     node.className += " fullscreenBgImage";
            //         // } else {
            //             node.className += " withBgImage";
            //         // }
            //         // return;
            //     }
            // }
            //
            // if(node.parentNode && node.parentNode.tagName && node.parentNode.tagName.toLowerCase() != "body"){
            //     console.log("color=" + computedStyle.backgroundColor);
            //     var color = parseColor(computedStyle.backgroundColor);
            //     if(computedStyle && (!color[3] || color[3] <= 0.6)){
            //         if(!node.className.includes("noBgColor")){
            //             node.className += " noBgColor";
            //         }
            //     } else {
            //         if(!node.className.includes("withBgColor")){
            //             node.className += " withBgColor";
            //         }
            //     }
            // }
            tagElement(node);

        }
        if(checkChild){
            var childNodes = node.childNodes;
            for(var i=0;i<childNodes.length;i++){
                analyzeAndModifyNode(childNodes[i], checkChild, depth+1);
            }
        }
    }
}

function tagElement(node){
    if(node instanceof SVGElement){
        return;
    }
    console.log("tagElement tag=" + node.tagName + ", class=" + node.className + ", id=" + node.id);

    var computedStyle = window.getComputedStyle(node);
    // if(node.className.includes("wq")){
    //     console.log("found wq");
    //     console.log("class wq width=" + node.offsetWidth + ", height=" + node.offsetHeight);
    // }

    if(node.offsetWidth/window.innerWidth > 0.8 && node.offsetHeight/window.innerHeight > 0.8){
        console.log("found full screen image");
        if(!node.className || !node.className.includes("fullscreenBgImage")){
            node.className += " fullscreenBgImage";
        }
    } else if(!node.className || !node.className.includes("withBgImage")){
        if(computedStyle != null && computedStyle.backgroundImage != "none"){
            // if(node.offsetWidth/window.innerWidth > 0.6 && node.offsetHeight/window.innerHeight > 0.6){
            //     console.log("found full screen image");
            //     node.className += " fullscreenBgImage";
            // } else {
                node.className += " withBgImage";
            // }
            return;
        }
    }

    if(node.parentNode && node.parentNode != document.body){
        // console.log("color=" + computedStyle.backgroundColor);
        var color = parseColor(computedStyle.backgroundColor);
        if(computedStyle && (!color[3] || color[3] <= 0.6)){
            if(!node.className || !node.className.includes("noBgColor")){
                node.className += " noBgColor";
            }
        } else {
            if(!node.className || !node.className.includes("withBgColor")){
                node.className += " withBgColor";
            }
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
