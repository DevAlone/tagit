import * as log from "./misc/log";
import {commentNodeToData} from "./misc/pikabu";
import {createPikabuCommentIfNotExists} from "./models/db";

log.debug("backgroundPikabuCommentsUpdater.js");

/**
 * processes saved comments page
 * @param page
 * @returns {Promise<int>} number of comments on page
 */
async function processSavedCommentsPage(page) {
    log.info("processSavedCommentsPage(" + page + ");");

    const result = await fetch("https://pikabu.ru/saved-comments?cmd=saved_comments&page=" + page);
    const binaryResp = (await result.arrayBuffer());
    const decoder = new TextDecoder("windows-1251");
    const html = decoder.decode(binaryResp);
    const dom = (new DOMParser()).parseFromString(html, "text/html");
    const comments = dom.querySelectorAll('.page-comments[data-role="saved"] .comments__main .comment');
    log.debug("page " + page + " has " + comments.length + " comments");

    for (const comment of comments) {
        const commentData = commentNodeToData(comment);

        let saveButton = comment.querySelector('.comment__body .comment__tool[data-role="save"]');

        const isSavedOnPikabu = saveButton.classList.contains("comment__tool_active");
        if (isSavedOnPikabu) {
            const wasSaved = await createPikabuCommentIfNotExists(
                commentData.id,
                commentData.commentLink,
                commentData.storyId,
                commentData.authorUsername,
                commentData.createdAtDate,
                commentData.contentHTML,
                commentData.contentText,
                commentData.contentImages,
            );

            if (wasSaved) {
                log.info("comment " + commentData.id + " saved successfully");
            } else {
                log.info("comment " + commentData.id + " already existed");
            }
        }
    }

    return comments.length;
}

async function main() {
    try {
        for (let i = 1; i < 999; ++i) {
            const numberOfSavedComments = await processSavedCommentsPage(i);
            if (numberOfSavedComments === 0) {
                return;
            }
        }
    } catch (e) {
        log.error(e);
        console.log(e);
        throw e;
    }
}

(async () => {
    await main()
})();