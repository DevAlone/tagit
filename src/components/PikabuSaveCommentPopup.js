import React from 'react';
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import * as rpc from "../misc/rpc";
import * as log from "../misc/log";
import TextField from "@material-ui/core/TextField";

class PikabuSaveCommentPopup extends React.Component {
    state = {
        commentId: 0,
        commentData: 0,
        tags: [],
        newTagValue: "",
    };

    constructor(props) {
        super(props);
        PikabuSaveCommentPopup.instance = this;
    }

    async componentDidMount() {
        await this.updateTags();
    }

    async updateTags() {
        const res = await rpc.callFromContentScript("models/db.js", "getAllTags", []);
        if (res.hasOwnProperty("exception")) {
            throw res.exception;
        }
        await this.setState({
            tags: res.response,
        })
    }

    async onShown() {
        try {
            await this.updateTags();
            // TODO: update comment if exists?
            const res = await rpc.callFromContentScript("models/db.js", "createPikabuCommentIfNotExists", [
                this.state.commentId,
                this.state.commentData.authorUsername,
                this.state.commentData.createdAtDate,
                this.state.commentData.contentHTML,
                this.state.commentData.contentText,
                this.state.commentData.contentImages,
            ]);

            if (res.hasOwnProperty("exception")) {
                throw res.exception;
            }

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

    onNewTagFieldChange = (e) => {
        this.setState({
            newTagValue: e.target.value,
        });
    };

    onNewTagAddClicked = async () => {
        try {
            console.log("tryna create a tag");
            const res = await rpc.callFromContentScript("models/db.js", "createTagIfNotExists", [
                this.state.newTagValue,
            ]);
            console.log("done creating a tag");

            if (res.hasOwnProperty("exception")) {
                throw res.exception;
            }

            const wasSaved = res.response;

            if (wasSaved) {
                log.info("tag " + this.state.commentId + " saved successfully");
            } else {
                log.info("tag " + this.state.commentId + " already existed");
            }
        } catch (e) {
            alert(JSON.stringify(e));
            console.log(e);
            throw e;
        }

        await this.updateTags();
    };

    render() {
        return (
            <Paper>
                {
                    this.state.tags.map((element, index) => {
                        return <Button key={index}>{element.name}</Button>;
                    })
                }
                <TextField onChange={(e) => {
                    this.onNewTagFieldChange(e)
                }}/>
                <Button onClick={async () => {
                    await this.onNewTagAddClicked()
                }}>+</Button>
            </Paper>
        )
    }
}

export default PikabuSaveCommentPopup;
