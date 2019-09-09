// var browser = browser || chrome;

function openMainPage() {
    browser.tabs.create({
        url: "index.html"
    });
}

browser.browserAction.onClicked.addListener(openMainPage);
