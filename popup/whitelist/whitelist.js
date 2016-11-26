var bgPage = chrome.extension.getBackgroundPage();
var DEBUG = bgPage.DEBUG;

/* page event */
document.addEventListener("DOMContentLoaded", function() {
    /* init whitelist options */
    var radExclude = document.getElementById("radExclude");
    var radInclude = document.getElementById("radInclude");
    var option = bgPage.values[bgPage.KEY_WHITELIST_OPTIONS];
    if(option == 0) {
        radExclude.checked = true;
    } else {   
        radInclude.checked = true;
    }
    radExclude.addEventListener("change", function(ev) {
        if(DEBUG) console.log("radExclude change");
        if(ev.target.checked) {
            bgPage.saveValue(bgPage.KEY_WHITELIST_OPTIONS, ev.target.value);
            bgPage.sendMessageToAllContentScript({action: "changeColor"});
        }
    });
    radInclude.addEventListener("change", function(ev) {
        if(DEBUG) console.log("radInclude change");
        if(ev.target.checked) {
            bgPage.saveValue(bgPage.KEY_WHITELIST_OPTIONS, ev.target.value);
            bgPage.sendMessageToAllContentScript({action: "changeColor"});
        }
    });

    /* init back button */
    var btnBack = document.getElementById("btnBack");
    btnBack.addEventListener("click", function(ev) {
        window.location.href = "../popup.html";
    });

    /* init whitelist table */
    var tblWhitelist = document.getElementById('tblWhitelist');
    var divWhitelist = document.getElementById('divWhitelist');

    var keys = Object.keys(bgPage.whitelist);

    if(keys.length == 0) {

        divWhitelist.style.display = "none";

    } else {
        var row, hostCol, deleteCol;
        var deleteimage;
        for(var i=0;i<keys.length;i++) {
            row = document.createElement("tr");

            hostCol = document.createElement("td");
            hostCol.width = "90%";
            hostCol.innerText = keys[i];
            row.appendChild(hostCol);

            deleteCol = document.createElement("td");
            deleteCol.width = "10%";
            deleteImage = document.createElement("input");
            deleteImage.type = "image";
            deleteImage.src = "../../imgs/minus-flat.svg";
            deleteImage.value = keys[i];
            deleteImage.className = "actionImageBtn";
            deleteImage.addEventListener('click', onBtnDeleteClick);

            deleteCol.appendChild(deleteImage);
            row.appendChild(deleteCol);

            tblWhitelist.appendChild(row);
        }
    }

    /* init action button */
    var btnDeleteAll = document.getElementById('btnDeleteAll');
    btnDeleteAll.addEventListener('click', function(ev) {
        var deleteAllDialog = document.getElementById('deleteAllDialog');
        deleteAllDialog.style.display = "block";
        var btnYes = deleteAllDialog.getElementsByClassName('btnYes')[0];
        btnYes.addEventListener('click',function(ev) {
            onDeleteAllClick(ev);
            deleteAllDialog.style.display = "none";
        });

        var btnNo = deleteAllDialog.getElementsByClassName('btnNo')[0];
        btnNo.addEventListener('click', function(ev) {
            deleteAllDialog.style.display = "none";
        });

    });
});

function onDeleteAllClick(ev) {
    bgPage.deleteAllWhitelist();
    var divWhitelist = document.getElementById('divWhitelist');
    var tblWhitelist = document.getElementById('tblWhitelist');
    for(var i = tblWhitelist.rows.length - 1; i >= 0; i--) {
        tblWhitelist.deleteRow(i);
    }
    divWhitelist.style.display = "none";
    bgPage.sendMessageToAllContentScript({action: "changeColor"});
}

function onBtnDeleteClick(ev) {
    var host = ev.target.value;
    bgPage.deleteFromWhitelist(host);

    var rowIndex = ev.target.parentNode.parentNode.rowIndex;
    var tblWhitelist = document.getElementById('tblWhitelist');
    tblWhitelist.deleteRow(rowIndex);

    if(tblWhitelist.rows.length == 0){
        var divWhitelist = document.getElementById('divWhitelist');
        divWhitelist.style.display = "none";
    }
    bgPage.sendMessageToAllContentScript({action: "changeColor"});
}
