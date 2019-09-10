// document.body.style.border = "5px solid green";
console.log("pikabu.ru.js");

/*
function commentNodeToData(commentNode) {
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


function addTagButton(comment) {
    const id = comment.getAttribute("data-id");
    let saveButton = comment.querySelector('.comment__tool[data-role="save"]');
    saveButton.addEventListener('click', () => {
        console.log("clicked id " + id);
        saveCommentToStorage(id, comment);
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
*/
