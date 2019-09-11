// functions to talk with background from content script

import * as db from "../models/db";

/* global browser */

export async function callFromContentScript(fileName, functionName, args) {
    console.log("tryna call rp from content script");
    console.log(browser);
    return await browser.runtime.sendMessage({
        method: "call",
        fileName: fileName,
        functionName: functionName,
        args: args,
    });
}

export async function listenFromBackgroundScript() {
    console.log("listening from background script")
    browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        console.log("got request: " + JSON.stringify(request));
        const res = await handleRequest(request);

        return {
            request: request,
            response: res,
        };
    });
}

async function handleRequest(request) {
    const method = request.method;
    const fileName = request.fileName;
    const functionName = request.functionName;
    const args = request.args;

    const methods = {
        "call": async () => {
            return await handleCallRequest(fileName, functionName, args);
        },
    };

    return await methods[method]();
}

async function handleCallRequest(fileName, functionName, args) {
    const files = {
        "models/db.js": async () => {
            return db[functionName](...args);
        },
    };

    return await files[fileName]();
}
