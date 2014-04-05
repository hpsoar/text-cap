var theTextArea = null;
var enabled = false;
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "init") {
        enabled = false;
        chrome.pageAction.show(sender.tab.id);
        if (theTextArea == null) {
            theTextArea = document.createElement('textarea');
            document.body.appendChild(theTextArea);
        }
        sendResponse({data: 'test' });
    }
    else if (request.type === 'get_data') {
        if (theTextArea == null) {
            sendResponse({ data : 'textarea not initialized, please enable this extension'});
        }
        else {
            theTextArea.select();
            document.execCommand("paste");
            sendResponse({ data : theTextArea.value });
        }
    }
    else if (request.type === 'copy') {
        theTextArea.value = request.data;
        theTextArea.select();
        document.execCommand("copy");
        sendResponse({ data : request.data });
    }

    function send(request) {
        chrome.tabs.sendMessage(sender.tab.id, request, function(response) {});
    }
});

chrome.pageAction.onClicked.addListener(function onClicked(tab) {
    enabled = !enabled;
    chrome.tabs.sendMessage(tab.id, { type: (enabled ? "enabled" : 'disabled') }, function(response) {});
});

