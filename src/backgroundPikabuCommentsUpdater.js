import * as log from "./misc/log";
import {processSavedCommentsPage} from "./misc/pikabu";

log.debug("backgroundPikabuCommentsUpdater.js");

async function main() {
    try {
        if (/Chrome/.test(window.navigator.userAgent)) {
            // TODO: remove this workaround in version 79 https://bugs.chromium.org/p/chromium/issues/detail?id=617198
            // if we're in chrome
            // allow putting pikabu in frame
            window.browser.webRequest.onHeadersReceived.addListener(
                e => {
                    let cspFound = false;

                    for (let header of e.responseHeaders) {
                        if (header.name.toLowerCase() === "content-security-policy") {
                            header.value += "; frame-ancestors " + window.browser.extension.getURL('');
                            cspFound = true;
                            break;
                        }
                    }

                    if (!cspFound) {
                        e.responseHeaders.push({
                            name: "content-security-policy",
                            value: "; frame-ancestors " + window.browser.extension.getURL(''),
                        });
                    }

                    return {responseHeaders: e.responseHeaders};
                },
                {
                    urls: ["https://pikabu.ru/*"],
                },
                ["blocking", "responseHeaders"],
            );


            log.debug("We're in Chrome");
            // doesn't work for some reason
            // let pikabuFrame = document.createElement("iframe");
            // pikabuFrame.src = "https://pikabu.ru/information/contacts#special_url_for_tagit_iengekou1Chai4Ese1EPei9seehee0oe";
            // document.body.appendChild(pikabuFrame);
            return;
        }

        for (let i = 1; i < 999; ++i) {
            const numberOfSavedComments = await processSavedCommentsPage(i, false);
            if (numberOfSavedComments === 0) {
                return;
            }
        }
    } catch (e) {
        log.error(e);
        throw e;
    }
}

(async () => {
    await main()
})();