/* global browser */

function openMainPage() {
    browser.tabs.create({
        url: "index.html"
    });
}

browser.browserAction.onClicked.addListener(openMainPage);

/*
// TODO: delete?
const jsLocation = "static/js/main.js";

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && jsLocation !== null) {
        browser.tabs.executeScript(tabId, {
            file: jsLocation,
            runAt: "document_end",
        });
    }
});
 */
