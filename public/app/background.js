/* global browser */

function openMainPage() {
    browser.tabs.create({
        url: "index.html"
    });
}

browser.browserAction.onClicked.addListener(openMainPage);
