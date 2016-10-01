var pyngon = pyngon || {};
pyngon.DEBUG = false;

if(!pyngon.tlvCS){

    pyngon.tlvCS = (function(){
        var originalDocumentClass;
        var newStyleElement;
        var maxDepth = 25;
        var startDelay;
        var isAnalyzed = false;

        function observeBody(body){
            var bodyMutationObserver = new MutationObserver(function(records){
                chrome.storage.local.get("depth", function(result){
                    if(result){
                        maxDepth = result["depth"];
                    }
                    for(var i=0;i<records.length;i++){
                        if (records[i].type == "childList"){
                            for(var j=0;j<records[i].addedNodes.length;j++){
                                analyzeAndModifyNode(records[i].addedNodes[j], true, 0);
                            }
                        }
                    }

                });

            });

            var bodyInit = {childList: true, subtree: true};
            bodyMutationObserver.observe(body, bodyInit);
        };

        function analyzeAndModifyNode(node, checkChild, depth){
            if(maxDepth && maxDepth > 0 && depth > maxDepth){
                return;
            }
            // if(node && (!node.className || (!node.className.includes("noBgColor") && !node.className.includes("withBgColor") && !node.className.includes("withBgImage")))) {

            if(node.nodeType == Node.ELEMENT_NODE){
                tagElement(node);
            }
            if(checkChild){
                var childNodes = node.childNodes;
                for(var i=0;i<childNodes.length;i++){
                    analyzeAndModifyNode(childNodes[i], checkChild, depth+1);
                }
            }

            // }
        };

        function tagElement(node){
            if(node instanceof SVGElement){
                return;
            }
            if(pyngon.DEBUG) console.log("tagElement tag=" + node.tagName + ", class=" + node.className + ", id=" + node.id);

            var computedStyle = window.getComputedStyle(node);

            if(node.offsetWidth/window.innerWidth > 0.6 && node.offsetHeight/window.innerHeight > 0.6){
                if(!node.className || !node.className.includes("fullscreenBgImage")){
                    node.className += " fullscreenBgImage";
                }
            } else if(!node.className || !node.className.includes("withBgImage")){
                if(computedStyle != null && computedStyle.backgroundImage != "none"){
                    node.className += " withBgImage";
                    return;
                }
            }

            if(node.parentNode && node.parentNode != document.body){
                var color = parseColor(computedStyle.backgroundColor);
				if(computedStyle){
					if(!color || !color[3] || color[3] <= 0.6){
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
        };

        function backToNormalBrightness(){
            if(document.documentElement.className.includes("tlvNightModeOn")){
                // document.documentElement.style.color = originalColor;
                var brightenInterval = setInterval(function(){
                    var filter = document.documentElement.style.webkitFilter;
                    var brightness = /^brightness\(([\d]+)%\)/.exec(filter);
                    if(brightness && brightness.length > 0){
                        var intBrightness = parseInt(brightness[1]);
                        if(intBrightness < 100){
                            var inc = Math.min(intBrightness + 2, 100);
                            document.documentElement.style.webkitFilter = "brightness(" + inc + "%)";
                        } else {
                            document.documentElement.style.webkitFilter = "";
                            clearInterval(brightenInterval);
                        }
                    } else {
                        document.documentElement.style.webkitFilter = "";
                        clearInterval(brightenInterval);
                    }

                }, 100);
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
            else {
				//throw Error(color + ' is not supported by $.parseColor');
				console.log("parseColor fail color=" + color);
				return null;
			}

            // Performs RGBA conversion by default
            isNaN(cache[3]) && (cache[3] = 1);

            // Adds or removes 4th value based on rgba support
            // Support is flipped twice to prevent erros if
            // it's not defined
            return cache.slice(0,4);
        };

        return {

            traceDOM: function(node){
                if(node.nodeType == Node.ELEMENT_NODE){
                    tagElement(node);
                }

                var childNodes = node.childNodes;
                for(var i=0;i<childNodes.length;i++){
                    this.traceDOM(childNodes[i]);
                }
            },

            disable: function(){
                if(pyngon.DEBUG) console.log("disable className=" + document.documentElement.className);
                document.documentElement.className = document.documentElement.className.replace(new RegExp('tlvNightModeOn', 'g'), '');
            },

            enable: function(){
                document.documentElement.className += " tlvNightModeOn";
                if(!isAnalyzed){
                    pyngon.tlvCS.run();
                }
            },

            hideBgImage: function(){
                document.documentElement.className += " tlvHideBgImage";
            },

            showBgImage: function(){
                document.documentElement.className = document.documentElement.className.replace(new RegExp('tlvHideBgImage', 'g'), '');
            },

            startAnalyse: function(){
                // Can not use "this". Because this function is invoked by setTimeout, this will become window.
                pyngon.tlvCS.traceDOM(document.body);
                observeBody(document.body);
                backToNormalBrightness();

                isAnalyzed = true;
            },

            run: function(){
                if(startDelay){
                    clearTimeout(startDelay);
                    startDelay = null;
                }
                startDelay = setTimeout(this.startAnalyse,1500);
            }
        };

    })();

}

chrome.storage.local.get("isEnabled", function(result){
    if(pyngon.DEBUG) console.log("local.get=" + result["isEnabled"]);
    if(result["isEnabled"] != 0){
        if(!document.documentElement.className.includes("tlvNightModeOn")){
            document.documentElement.className += " tlvNightModeOn";
        }
        pyngon.tlvCS.run();
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(pyngon.DEBUG) console.log("received request=" + request.isEnable);
        if(request.isEnable != undefined){
            if (request.isEnable) {
                pyngon.tlvCS.enable();
            } else {
                pyngon.tlvCS.disable();
            }
        }

        if(request.isHideBgImage != undefined){
            if (request.isHideBgImage) {
                pyngon.tlvCS.hideBgImage();
            } else {
                pyngon.tlvCS.showBgImage();
            }
        }

        sendResponse({status: "ok1"});
    }
);

//pyngon.tlvCS.run();
