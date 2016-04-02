if(document.documentElement.className.includes("recolor-enabled")){
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
        }

    }, 100);
}
