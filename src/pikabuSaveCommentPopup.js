import React from 'react';
import ReactDOM from 'react-dom';
import './pikabuSaveCommentPopup.css';
import * as react_alert from 'react-alert';
import {Provider as AlertProvider} from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

console.log("pikabuSaveCommentPopup.js is running");
document.body.style.border = "5px solid red";

const alertOptions = {
    position: react_alert.positions.BOTTOM_RIGHT,
    timeout: 5000,
    offset: '30px',
    transition: react_alert.transitions.SCALE
};

class PikabuSaveCommentPopupRoot extends React.Component {
    render() {
        return (
            <div className={'react-extension'}>
                <p>Hello From React Extension!</p>
            </div>
        )
    }
}


/*
const Root = () => (
    <AlertProvider template={AlertTemplate} {...alertOptions}>
        <div>
            hello from react extensino!
        </div>
    </AlertProvider>
);
*/

const pikabuSaveButtonDialog = document.createElement('div');
pikabuSaveButtonDialog.id = 'tagit__pikabuSaveButtonDialog';
document.body.appendChild(pikabuSaveButtonDialog);

ReactDOM.render(<PikabuSaveCommentPopupRoot/>, pikabuSaveButtonDialog);

/*function commentNodeToData(commentNode) {
    return {
        id: commentNode.getAttribute("data-id"),
        authorUsername: commentNode.querySelector(".comment__user").getAttribute("data-name"),
        createdAtDate: commentNode.querySelector(".comment__datetime").getAttribute("datetime"),
        contentHTML: commentNode.querySelector(".comment__content").innerHTML,
        contentText: "// TODO: implement",
        contentImages: Array.from(commentNode.querySelectorAll('.comment-image a')).map(x => x.href),
    };
}

async function tagComment(commentId, tagId) {
    const commentKey = "pikabu:comment__" + commentId;
    const tagKey = "tag__" + tagId;
    let comment = (await browser.storage.sync.get(commentKey))[commentKey];
    let tag = await browser.storage.sync.get(tagKey);
    console.log("comment");
    console.log(comment);

    comment.tags = Array.from(new Set(comment.tags).add(tagId));
    tag.items = Array.from(new Set(tag.items).add(commentKey));

    let obj = {};
    obj[commentKey] = comment;
    obj[tagKey] = tag;
    await browser.storage.sync.set(obj);
}

// saves comment to sync storage
async function saveCommentToStorage(id, commentNode) {
    const commentData = commentNodeToData(commentNode);

    try {
        await db.createPikabuCommentIfNotExists(
            id,
            commentData.authorUsername,
            commentData.createdAtDate,
            commentData.contentHTML,
            commentData.contentText,
            commentData.contentImages
        );
        // TODO: alert
        console.log("saved succesfully");
        // const tag = await createTagIfNotExists("none");
        // await tagComment(id, tag.id);
    } catch (e) {
        console.log("error happened");
        console.log(e);
    }
}
 */


function addTagButton(comment) {
    const id = comment.getAttribute("data-id");
    let saveButton = comment.querySelector('.comment__tool[data-role="save"]');
    saveButton.addEventListener('click', e => {
        console.log("clicked id " + id);
        let popup = document.getElementById("tagit__pikabuSaveButtonDialog");
        popup.style.visibility = "visible";
        popup.style.left = e.pageX + "px";
        popup.style.top = e.pageY + "px";
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
        document.getElementsByClassName("page-story__comments")[0],
        {
            childList: true,
            subtree: true,
        }
    );

    // observer.disconnect();
    console.log("observing started");
}

startObserving();
