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

    return {
        id: id,
        commentLink: commentLink,
        storyId: storyId,
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
        PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance.current.setState({
            commentId: id,
            commentData: commentNodeToData(comment),
        }, () => {
            PikabuSaveCommentPopupRoot.pikabuSaveCommentPopupInstance.current.onShown();
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
