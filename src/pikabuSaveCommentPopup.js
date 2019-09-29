import React from 'react';
import ReactDOM from 'react-dom';
import './pikabuSaveCommentPopup.css';
import PikabuSaveCommentPopup from "./components/PikabuSaveCommentPopup";
import * as log from "./misc/log";
import * as react_alert from "react-alert";
import {Provider as AlertProvider} from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'

// TODO: remove
document.body.style.border = "5px solid red";

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
                <PikabuSaveCommentPopup ref={PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance}/>
            </AlertProvider>
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
    const commentLink = commentNode.querySelector('.comment__tools .comment__tool[data-role="link"]').href;
    const storyId = commentLink.match(/^https?:\/\/.*pikabu.ru\/story\/.*_([0-9]+)\?cid=[0-9]+/i)[1];

    let contentText = "";
    {
        let commentContent = commentNode.querySelector(".comment__content").cloneNode(true);
        const images = commentContent.querySelectorAll(".comment-image");
        for (const image of images) {
            commentContent.removeChild(image);
        }
        contentText = commentContent.innerHTML;
    }

    return {
        id: id,
        commentLink: commentLink,
        storyId: storyId,
        authorUsername: commentNode.querySelector(".comment__user").getAttribute("data-name"),
        createdAtDate: commentNode.querySelector(".comment__datetime").getAttribute("datetime"),
        contentHTML: commentNode.querySelector(".comment__content").innerHTML,
        contentText: contentText,
        contentImages: Array.from(commentNode.querySelectorAll('.comment-image a')).map(x => x.href),
    };
}

function closePikabuSaveButtonDialog() {
    pikabuSaveButtonDialog.style.visibility = "hidden";
    document.removeEventListener("click", closePikabuSaveButtonDialogEvent);
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

function addTagButton(comment) {
    const id = comment.getAttribute("data-id");
    let saveButton = comment.querySelector('.comment__body .comment__tool[data-role="save"]');
    if (saveButton === null) {
        // for example for comment of the day
        return;
    }
    const openSaveCommentPopup = e => {
        PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance.current.setState({
            commentId: id,
            commentData: commentNodeToData(comment),
        }, () => {
            let popup = document.getElementById("tagit__pikabuSaveButtonDialog");
            popup.style.visibility = "visible";
            popup.style.left = e.pageX + "px";
            popup.style.top = e.pageY + "px";
            document.getElementById("tagit_pikabuSaveCommentPopupInput").focus();
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
    console.log("tagit: error:");
    console.log(e);
    throw e;
}
