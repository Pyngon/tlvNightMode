function analyzeAndModifyNode(node, checkChild){
    if(node.nodeType == Node.ELEMENT_NODE){
        console.log("analyzeAndModifyNode in worker");

        var computedStyle = window.getComputedStyle(node);

        if(!node.className.includes("withBgImage")){
            if(computedStyle != null && computedStyle.backgroundImage != "none"){
                // console.log("tag=" + node.tagName + ", window.getComputedStyle(node).backgroundImage=" + window.getComputedStyle(node).backgroundImage);
                // node.className += " withBgImage";
                postMessage({node: node, addClass: "withBgImage"});
                return;
            }
        }

        if(node.parentNode && node.parentNode.tagName && node.parentNode.tagName.toLowerCase() != "body"){
            // console.log("color=" + computedStyle.backgroundColor);
            // var color = parseColor(computedStyle.backgroundColor);
            // if(computedStyle && (!color[3] || color[3] != 1)){
            //     console.log("tag=" + node.parentNode.tagName + ", noBgColor=" + computedStyle.backgroundColor);
            //     if(!node.className.includes("noBgColor")){
            //         node.className += " noBgColor";
            //     }
            // } else {
            //     if(!node.className.includes("withBgColor")){
            //         console.log("tag=" + node.parentNode.tagName + ", withBgColor=" + computedStyle.backgroundColor);
            //         node.className += " withBgColor";
            //     }
            // }


            if(computedStyle
                && (computedStyle.display == "none" || computedStyle.visibility == "hidden")){
                if(!node.className.includes("recolorHiddenElement")){
                    // node.className += " recolorHiddenElement";
                    postMessage({node: node, addClass: "recolorHiddenElement"});
                }
            }
            // else if(first == true){
            //     if(!node.className.includes("recolorAddedNode")){
            //         node.className += " recolorAddedNode";
            //     }
            // }

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

self.onmessage = function(e) {
    console.log(e.data);
    // analyzeAndModifyNode(e.data.node, e.data.isCheckChild);
}
