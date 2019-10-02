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