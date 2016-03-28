var pyngon = pyngon || {};

pyngon.webColor = (function(){
    var originalDocumentClass;
    var newStyleElement;

    return {
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

// console.log("length=" + document.styleSheets.length);
// for(var i=0;i<document.styleSheets.length;i++){
//     console.log(document.styleSheets[i]);
// }

pyngon.webColor.traceDOM(document.body);

var nodeArray = [];
var timeoutObj;
observeBody(document.body);
function observeBody(body){
    var bodyMutationObserver = new MutationObserver(function(records){
        for(var i=0;i<records.length;i++){
            if (records[i].type == "childList"){
                for(var j=0;j<records[i].addedNodes.length;j++){
                    analyzeAndModifyNode(records[i].addedNodes[j], true, 0);
                }
            }

        }
    });
    // var bodyInit = {childList: true, attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ["class"]};
    var bodyInit = {childList: true, subtree: true};
    bodyMutationObserver.observe(body, bodyInit);
}

function analyzeAndModifyNode(node, checkChild, depth){
    // if(depth > 20){
    //     return;
    // }

    if(node && (!node.className || (!node.className.includes("noBgColor") && !node.className.includes("withBgColor") && !node.className.includes("withBgImage")))) {

        if(node.nodeType == Node.ELEMENT_NODE){
            console.log("analyzeAndModifyNode tag=" + node.tagName + ", class=" + node.className + ", id=" + node.id);
                var computedStyle = window.getComputedStyle(node);
                if(!node.className.includes("withBgImage")){
                    if(computedStyle != null && computedStyle.backgroundImage != "none"){
                        node.className += " withBgImage";
                        return;
                    }
                }

                if(node.parentNode && node.parentNode.tagName && node.parentNode.tagName.toLowerCase() != "body"){
                    console.log("color=" + computedStyle.backgroundColor);
                    var color = parseColor(computedStyle.backgroundColor);
                    if(computedStyle && (!color[3] || color[3] != 1)){
                        if(!node.className.includes("noBgColor")){
                            node.className += " noBgColor";
                        }
                    } else {
                        if(!node.className.includes("withBgColor")){
                            node.className += " withBgColor";
                        }
                    }
                }
        }
        if(checkChild){
            var childNodes = node.childNodes;
            for(var i=0;i<childNodes.length;i++){
                analyzeAndModifyNode(childNodes[i], checkChild, depth+1);
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
