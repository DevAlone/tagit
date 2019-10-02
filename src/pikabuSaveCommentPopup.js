import React from 'react';
import ReactDOM from 'react-dom';
import './pikabuSaveCommentPopup.css';
import PikabuSaveCommentPopup from "./components/PikabuSaveCommentPopup";
import * as log from "./misc/log";
import * as react_alert from "react-alert";
import {Provider as AlertProvider} from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import * as rpc from "./misc/rpc";
import Paper from "@material-ui/core/Paper";
import {commentNodeToData} from "./misc/pikabu";

const alertOptions = {
    position: react_alert.positions.BOTTOM_RIGHT,
    timeout: 5000,
    offset: '30px',
    transition: react_alert.transitions.SCALE
};

class PikabuSaveCommentPopupRoot extends React.Component {
    constructor(props) {
        super(props);
        PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance = React.createRef();
    }

    render() {
        return (
            <AlertProvider template={AlertTemplate} {...alertOptions}>
                <Paper className={"tagit__pikabuSaveCommentPopupRoot"}>
                    <PikabuSaveCommentPopup ref={PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance}/>
                </Paper>
            </AlertProvider>
        )
    }
}

const pikabuSaveButtonDialog = document.createElement('div');
pikabuSaveButtonDialog.id = 'tagit__pikabuSaveButtonDialog';
document.body.appendChild(pikabuSaveButtonDialog);

ReactDOM.render(<PikabuSaveCommentPopupRoot/>, pikabuSaveButtonDialog);


function getCommentContainerBlock(commentId) {
    return document.querySelector(".comments__main #comment_" + commentId).closest(".comments_show");
}

function getPlaceholderForHiddenComment(commentId) {
    const element = document.getElementById("tagit__placeholderForHiddenComment" + commentId);
    if (element !== null) {
        element.style.display = "flex";
        return element;
    }

    let placeholderNode = document.createElement("div");
    placeholderNode.id = "tagit__placeholderForHiddenComment" + commentId;
    placeholderNode.setAttribute("commentId", commentId);
    // placeholderNode.textContent = "Комментарий был скрыт расширением tagit";
    placeholderNode.style.width = "100%";
    placeholderNode.style.display = "flex";
    placeholderNode.style["flex-direction"] = "row";
    placeholderNode.style["flex-wrap"] = "wrap";
    placeholderNode.style["justify-content"] = "space-between";
    placeholderNode.style["align-items"] = "center";
    placeholderNode.style["align-content"] = "center";
    placeholderNode.style["border-bottom"] = "1px solid #eee";
    placeholderNode.style["padding-bottom"] = "6px";
    placeholderNode.style["margin-top"] = "6px";

    placeholderNode.innerHTML = `
        <span style="padding-right: 5px">Комментарий был скрыт расширением tagit</span>
        <button>Показать</button>
    `;
    const showCommentBack = () => {
        getCommentContainerBlock(commentId).style.display = "block";
        placeholderNode.style.display = "none";
    };

    placeholderNode.querySelector("button").onclick = showCommentBack;

    return placeholderNode;
}

async function hideCommentIfNecessary(commentId) {
    // TODO: complete or remove this feature
    if (true) {
        return;
    }

    // hide comments if we're in comments page, comment has tags and user checked to do so
    log.debug("tryna hide a comment with id " + commentId);

    if (!window.location.pathname.startsWith("/saved-comments")) {
        log.debug("we're not in comments page, so I'm giving up");
        return;
    }

    let comment = document.getElementById("comment_" + commentId);
    if (comment === null) {
        // already hidden
        log.debug("comment with id " + commentId + " already hidden");
        return;
    }

    const tags = await rpc.callFromContentScript(
        "models/db.js",
        "getAllTagsByPikabuCommentId",
        [commentId],
    );

    if (tags.length > 0) {
        let commentContainer = getCommentContainerBlock(commentId);
        commentContainer.style.display = "none";

        let placeholderNode = getPlaceholderForHiddenComment(commentId);
        commentContainer.parentNode.insertBefore(placeholderNode, commentContainer);

        log.info("hid a comment with id ", commentId);
    }
}

async function hideLastTaggedCommentIfNecessary() {
    // hide comments if we're in comments page, comment has tags and user checked to do so
    await hideCommentIfNecessary(
        PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance.current.state.commentData.id
    );
}

async function closePikabuSaveButtonDialog() {
    log.debug("closing pikabu save button dialog");
    try {
        pikabuSaveButtonDialog.style.visibility = "hidden";
        document.removeEventListener("click", closePikabuSaveButtonDialogEvent);
        await hideLastTaggedCommentIfNecessary();
    } catch (e) {
        log.error(e);
        throw e;
    }
}

function closePikabuSaveButtonDialogEvent(e) {
    if (!pikabuSaveButtonDialog.contains(e.target)) {
        closePikabuSaveButtonDialog();
    }
}

(() => {
    window.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closePikabuSaveButtonDialog();
        }
    });
})();

async function addTagButton(comment) {
    try {
        const id = comment.getAttribute("data-id");
        let saveButton = comment.querySelector('.comment__body .comment__tool[data-role="save"]');
        if (saveButton === null) {
            // for example for comment of the day
            return;
        }

        const commentData = commentNodeToData(comment);

        const isSavedOnPikabu = saveButton.classList.contains("comment__tool_active");
        if (isSavedOnPikabu) {
            const wasSaved = await rpc.callFromContentScript(
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

            if (wasSaved) {
                log.info("comment " + commentData.id + " saved successfully");
            } else {
                log.info("comment " + commentData.id + " already existed");
            }
        }

        const openSaveCommentPopup = e => {
            PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance.current.setState({
                commentId: id,
                commentData: commentData,
            }, () => {
                let popup = document.getElementById("tagit__pikabuSaveButtonDialog");
                popup.style.visibility = "visible";
                popup.style.left = e.pageX + "px";
                popup.style.top = e.pageY + "px";
                document.getElementById("tagit__pikabuSaveCommentPopupInput").focus();
                PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance.current.onShown();

                setTimeout(() => {
                        document.addEventListener("click", closePikabuSaveButtonDialogEvent)
                    }, 50
                );
            });
        };

        saveButton.addEventListener('click', openSaveCommentPopup);
        saveButton.addEventListener('contextmenu', e => {
            e.preventDefault();
            openSaveCommentPopup(e);
        });

        await hideCommentIfNecessary(commentData.id);
    } catch (e) {
        log.error("error in pikabuSaveCommentPopup.js");
        log.error(e);
        throw e;
    }
}

const observerCallback = (mutationsList, observer) => {
    // not sure why it thinks mutation is not used
    // eslint-disable-next-line
    for (let mutation of mutationsList) {
        // eslint-disable-next-line
        for (let node of mutation.addedNodes) {
            if (node.className === "comment") {
                addTagButton(node);
            }
        }
    }
};

function startObserving() {
    // eslint-disable-next-line
    for (let comment of document.querySelectorAll('.comment')) {
        addTagButton(comment);
    }
    const observer = new MutationObserver(observerCallback);

    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true,
        }
    );

    log.info("observing new comments started");
}

try {
    startObserving()
} catch (e) {
    log.error("tagit: error:");
    log.error(e);
    throw e;
}
