import React from 'react';
import ReactDOM from 'react-dom';
import './pikabuSaveCommentPopup.css';
import PikabuSaveCommentPopup from "./components/PikabuSaveCommentPopup";
import * as log from "./misc/log";

// TODO: remove
document.body.style.border = "5px solid red";

class PikabuSaveCommentPopupRoot extends React.Component {
    render() {
        return (
            <PikabuSaveCommentPopup/>
        )
    }
}

const pikabuSaveButtonDialog = document.createElement('div');
pikabuSaveButtonDialog.id = 'tagit__pikabuSaveButtonDialog';
document.body.appendChild(pikabuSaveButtonDialog);

ReactDOM.render(<PikabuSaveCommentPopupRoot/>, pikabuSaveButtonDialog);


function commentNodeToData(commentNode) {
    const id = commentNode.getAttribute("data-id");
    commentNode = commentNode.querySelector(".comment__body");
    return {
        id: id,
        authorUsername: commentNode.querySelector(".comment__user").getAttribute("data-name"),
        createdAtDate: commentNode.querySelector(".comment__datetime").getAttribute("datetime"),
        contentHTML: commentNode.querySelector(".comment__content").innerHTML,
        contentText: commentNode.querySelector(".comment__content").innerText,
        contentImages: Array.from(commentNode.querySelectorAll('.comment-image a')).map(x => x.href),
    };
}


function closePikabuSaveButtonDialogEvent(e) {
    if (!pikabuSaveButtonDialog.contains(e.target)) {
        pikabuSaveButtonDialog.style.visibility = "hidden";
        document.removeEventListener("click", closePikabuSaveButtonDialogEvent);
    }
}

function addTagButton(comment) {
    const id = comment.getAttribute("data-id");
    let saveButton = comment.querySelector('.comment__body .comment__tool[data-role="save"]');
    saveButton.addEventListener('click', e => {
        PikabuSaveCommentPopup.instance.setState({
            commentId: id,
            commentData: commentNodeToData(comment),
        }, () => {
            PikabuSaveCommentPopup.instance.onShown();
            let popup = document.getElementById("tagit__pikabuSaveButtonDialog");
            popup.style.visibility = "visible";
            popup.style.left = e.pageX + "px";
            popup.style.top = e.pageY + "px";
            setTimeout(
                () => {
                    document.addEventListener("click", closePikabuSaveButtonDialogEvent)
                },
                50
            )
        });
    });
}

const observerCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
        for (let node of mutation.addedNodes) {
            if (node.className === "comment") {
                addTagButton(node);
            }
        }
    }
};

function startObserving() {
    for (let comment of document.querySelectorAll('.page-story__comments .comment')) {
        addTagButton(comment);
    }
    const observer = new MutationObserver(observerCallback);

    observer.observe(
        // document.getElementsByClassName("page-story__comments")[0],
        document.body,
        {
            childList: true,
            subtree: true,
        }
    );

    // observer.disconnect();
    log.info("observing new comments started");
}

startObserving();
