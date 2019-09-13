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
        await this.withAlertError(async () => {
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
        });
    }

    onNewTagFieldChange = (e) => {
        this.setState({
            newTagValue: e.target.value,
        });
    };

    onNewTagAddClicked = async () => {
        await this.withAlertError(async () => {
            const res = await rpc.callFromContentScript("models/db.js", "createTagIfNotExists", [
                this.state.newTagValue,
            ]);

            if (res.hasOwnProperty("exception")) {
                throw res.exception;
            }

            const wasSaved = res.response;

            if (wasSaved) {
                log.info("tag " + this.state.commentId + " saved successfully");
            } else {
                log.info("tag " + this.state.commentId + " already existed");
            }

            await this.updateTags();
        });
    };

    onTagClicked = async (tag) => {
        await this.withAlertError(async () => {
            const res = await rpc.callFromContentScript("models/db.js", "makePikabuCommentTagRelationIfNotExists", [
                this.state.commentId, tag.id,
            ]);

            if (res.hasOwnProperty("exception")) {
                throw res.exception;
            }

            const wasSaved = res.response;

            if (wasSaved) {
                log.info("tag comment relation " + this.state.commentId + ":" + tag.id + " saved successfully");
            } else {
                log.info("tag comment relation " + this.state.commentId + ":" + tag.id + " already existed");
            }

            await this.updateTags();
        });
    };

    withAlertError = async (func) => {
        try {
            return await func();
        } catch (e) {
            alert(JSON.stringify(e));
            console.log(e);
            throw e;
        }
    };

    render() {
        return (
            <Paper>
                {
                    this.state.tags.map((element, index) => {
                        return <Button key={index} onClick={async () => {
                            await this.onTagClicked(element);
                        }}>{element.name}</Button>;
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
