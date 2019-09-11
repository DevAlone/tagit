import React from 'react';
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import * as db from "../models/db";
import * as rpc from "../misc/rpc";

class PikabuSaveCommentPopup extends React.Component {
    state = {
        commentId: 0,
        commentData: 0,
        tags: [],
    };

    constructor(props) {
        super(props);
        PikabuSaveCommentPopup.instance = this;
    }

    async componentDidMount() {
        this.setState({
            tags: await db.getAllTags(),
        })
    }

    async onShown() {
        try {
            // const wasSaved = false;
            const res = await rpc.callFromContentScript("models/db.js", "createPikabuCommentIfNotExists", [
                this.state.commentData.id,
                this.state.commentData.authorUsername,
                this.state.commentData.createdAtDate,
                this.state.commentData.contentHTML,
                this.state.commentData.contentText,
                this.state.commentData.contentImages,
            ]);
            console.log("res: ");
            console.log(res);

            const wasSaved = res.response;

            console.log("saving done");

            if (wasSaved) {
                alert("saved succesfully");
                console.log("saved succesfully");
            }
        } catch (e) {
            alert(JSON.stringify(e));
            console.log(e);
        }
    }

    render() {
        return (
            <Paper>
                comment id is {this.state.commentId}
                {
                    this.state.tags.map((element, index) => {
                        return <Button>{element.name}</Button>;
                    })
                }
            </Paper>
        )
    }
}

export default PikabuSaveCommentPopup;

/*
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
