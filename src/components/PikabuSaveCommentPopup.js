import React from 'react';
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import * as db from "../models/db";
import * as rpc from "../misc/rpc";
import * as log from "../misc/log";

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
                this.state.commentId,
                this.state.commentData.authorUsername,
                this.state.commentData.createdAtDate,
                this.state.commentData.contentHTML,
                this.state.commentData.contentText,
                this.state.commentData.contentImages,
            ]);

            const wasSaved = res.response;

            if (wasSaved) {
                log.info("comment " + this.state.commentId + " saved successfully");
            } else {
                log.info("comment " + this.state.commentId + " already existed");
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
