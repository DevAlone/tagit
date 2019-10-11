import * as log from "./log";
import {createPikabuCommentIfNotExists} from "../models/db";
import * as rpc from "./rpc";

export function commentNodeToData(commentNode) {
    const id = commentNode.getAttribute("data-id");
    commentNode = commentNode.querySelector(".comment__body");
    const commentLink = commentNode.querySelector('.comment__tools .comment__tool[data-role="link"]').href;
    const storyId = commentLink.match(/^https?:\/\/.*pikabu.ru\/story\/.*_([0-9]+)\?cid=[0-9]+/i)[1];

    let contentText;
    {
        let commentContent = commentNode.querySelector(".comment__content").cloneNode(true);
        const images = commentContent.querySelectorAll(".comment-image");
        // not sure why it thinks image is not used
        // eslint-disable-next-line
        for (const image of images) {
            commentContent.removeChild(image);
        }
        contentText = commentContent.innerHTML;
    }

    let contentImages = Array.from(
        commentNode.querySelectorAll(".comment-image")
    ).map(node => {
        const child = node.querySelector("div");
        if (child !== null) {
            return child;
        }
        return node;
    }).map(imageNode => {
        if (imageNode.hasAttribute("data-source")) {
            return imageNode.getAttribute("data-source");
        }
        return imageNode.querySelector("a").getAttribute("href");
    });

    return {
        id: id,
        commentLink: commentLink,
        storyId: storyId,
        authorUsername: commentNode.querySelector(".comment__user").getAttribute("data-name"),
        createdAtDate: commentNode.querySelector(".comment__datetime").getAttribute("datetime"),
        contentHTML: commentNode.querySelector(".comment__content").innerHTML,
        contentText: contentText,
        contentImages: contentImages,
    };
}

/**
 * processes saved comments page
 * @param page
 * @returns {Promise<int>} number of comments on page
 */
export async function processSavedCommentsPage(page, useRPC) {
    log.info("processSavedCommentsPage(" + page + ");");

    let requestOptions = {
        credentials: "include",
    };

    const result = await fetch(
        "https://pikabu.ru/saved-comments?cmd=saved_comments&page=" + page,
        requestOptions,
    );
    const binaryResp = (await result.arrayBuffer());
    const decoder = new TextDecoder("windows-1251");
    const html = decoder.decode(binaryResp);

    log.debug("html: ", html);

    const dom = (new DOMParser()).parseFromString(html, "text/html");
    const comments = dom.querySelectorAll('.page-comments[data-role="saved"] .comments__main .comment');
    log.debug("page " + page + " has " + comments.length + " comments");

    for (const comment of comments) {
        const commentData = commentNodeToData(comment);

        let saveButton = comment.querySelector('.comment__body .comment__tool[data-role="save"]');

        const isSavedOnPikabu = saveButton.classList.contains("comment__tool_active");
        if (isSavedOnPikabu) {
            let wasSaved;
            if (useRPC) {
                wasSaved = await rpc.callFromContentScript(
                    "models/db.js",
                    "createPikabuCommentIfNotExists",
                    [
                        commentData.id,
                        commentData.commentLink,
                        commentData.storyId,
                        commentData.authorUsername,
                        commentData.createdAtDate,
                        commentData.contentHTML,
                        commentData.contentText,
                        commentData.contentImages,
                    ],
                );
            } else {
                wasSaved = await createPikabuCommentIfNotExists(
                    commentData.id,
                    commentData.commentLink,
                    commentData.storyId,
                    commentData.authorUsername,
                    commentData.createdAtDate,
                    commentData.contentHTML,
                    commentData.contentText,
                    commentData.contentImages,
                );
            }

            if (wasSaved) {
                log.info("comment " + commentData.id + " saved successfully");
            } else {
                log.info("comment " + commentData.id + " already existed");
            }
        }
    }

    return comments.length;
}
