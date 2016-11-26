var bgPage = chrome.extension.getBackgroundPage();
var colorBg, colorText, colorBorder, colorLink, colorVisitedLink;
var txtName;
var editId;

document.addEventListener("DOMContentLoaded", function(){
    editId = getEditId("id");
    if(bgPage.getTheme(editId) == undefined){
        /* Make sure the id is valid */
        editId = null;
    }

    console.log("editId=" + editId);
    initColor();

    var btnBack = document.getElementById("btnBack");
    btnBack.addEventListener("click", function(ev){
        window.location.href = "../popup.html";
    });

    var btnSave = document.getElementById("btnSave");
    btnSave.addEventListener("click", function(ev){
        var obj = {};
        obj.name = txtName.value;
        obj.bgColor = "#" + colorBg.value;
        obj.textColor = "#" + colorText.value;
        obj.borderColor = "#" + colorBorder.value;
        obj.linkColor = "#" + colorLink.value;
        obj.visitedLinkColor = "#" + colorVisitedLink.value;
        if(editId != null){
            /* Editing theme */
            bgPage.saveTheme(editId, obj);
        } else {
            /* Creating new theme */
            bgPage.addTheme(obj);
        }

        window.location.href = "../popup.html";
    });

    //console.log("location.search=" + window.location.search);
});

/**
 * Initialize color from current theme.
 */
function initColor(){
    txtName = document.getElementById("txtName");
    colorBg = document.getElementById("colorBg");
    colorText = document.getElementById("colorText");
    colorBorder = document.getElementById("colorBorder");
    colorLink = document.getElementById("colorLink");
    colorVisitedLink = document.getElementById("colorVisitedLink");

    var id = bgPage.currentThemeID;
    if(editId != null){
        id = editId;
    }
    var currentTheme = bgPage.getTheme(id);
    if(currentTheme == null){
        currentTheme = bgPage.preSetThemes["t1"];
    }

    if(currentTheme){
        colorBg.value = currentTheme.bgColor;
        colorText.value = currentTheme.textColor;
        colorBorder.value = currentTheme.borderColor;
        colorLink.value = currentTheme.linkColor;
        colorVisitedLink.value = currentTheme.visitedLinkColor;

        if(editId != null){
            txtName.value = currentTheme.name;
        }
    }
}

/**
 * Retrieve the id from url parameter
 */
function getEditId(variable){
    if(window.location.search){
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
        }
    }
    return null;
}
