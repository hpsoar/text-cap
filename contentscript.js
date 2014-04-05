var BORDER_THICKNESS = 4;
var overlay = null;
var outline = null;

var element, dimensions = {};
function mousemove(e) {
    if (element !== e.target) {
        element = e.target;
        dimensions.top = -window.scrollY;
        dimensions.left = -window.scrollX;
        var elem = e.target;
        while (elem !== document.body) {
            dimensions.top += elem.offsetTop;
            dimensions.left += elem.offsetLeft;
            elem = elem.offsetParent;
        }
        dimensions.width = element.offsetWidth;
        dimensions.height = element.offsetHeight

        outline.style.top = (dimensions.top - BORDER_THICKNESS) + "px";
        outline.style.left = (dimensions.left - BORDER_THICKNESS) + "px";
        outline.style.width = dimensions.width + "px";
        outline.style.height = dimensions.height + "px";
    }
}

function remove_overlay() {
    if (overlay && overlay.parentNode) {
        document.body.removeChild(overlay);
        document.body.removeEventListener("mousemove", mousemove, false);
    }
}

function add_overlay() {
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0px";
        overlay.style.left = "0px";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.pointerEvents = "none";
        outline = document.createElement("div");
        outline.style.position = "fixed";
        outline.style.border = BORDER_THICKNESS + "px solid rgba(255,0,0,0.5)";
        outline.style.borderRadius = "5px";
        overlay.appendChild(outline);
    }
    if (!overlay.parentNode) {
        document.body.appendChild(overlay);
        document.body.addEventListener("mousemove", mousemove, false);
//        document.body.addEventListener("mouseup", mouseup, false);
    }

}


var enabled = false;

function enable(flag) {
    enabled = flag;
    console.log(enabled ? 'enabled' : 'disabled');
    if (enabled) add_overlay();
    else remove_overlay();
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "enabled") {
        enable(true);
    }
    else if (request.type === 'disabled') {
        enable(false);
    }
    sendResponse({});
});

function send(request, callback) {
    chrome.extension.sendMessage(request, function(response) {
        if (callback != null) {
            callback(response);
        }
    });
}

function fill(input) {
    send({ type : 'get_data' }, function(rsp) {
        console.log('rsp: ' + rsp.data);
        input.val(rsp.data);
    });
}

$(function() {
    enabled = false;

    $('input[type=text]').focus(function() {
        if (enabled) {
            console.log('focus');
            fill($(this));
        }
    });
    $('body').click(function(e) {
        if (enabled) {
            console.log(e.target.nodeName);
            if (e.target.nodeName === 'INPUT') {
                fill($(this));
            }
            else {
                console.log(e.target.innerHTML);
                send({type : 'copy', data : e.target.innerHTML.substring(1) }, function(rsp) {
                    console.log('rsp: ' + rsp.data);
                });
            }
        }
    });
});

send({ type: "init" }, function(rsp) {
    console.log('rsp: ' + rsp.data);
});
