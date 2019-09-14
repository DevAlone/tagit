import React from 'react';
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import * as rpc from "../misc/rpc";
import * as log from "../misc/log";
import TextField from "@material-ui/core/TextField";
import {withAlert} from "react-alert";
import ChipInput from "material-ui-chip-input";
import * as db from "../models/db";

class PikabuSaveCommentPopup extends React.Component {
    state = {
        commentId: 0,
        commentData: 0,
        tags: []
    };

    async componentDidMount() {
        await this.updateTags();
    }

    async updateTags() {
        const tags = await rpc.callFromContentScript("models/db.js", "getAllTags", []);
        await this.setState({
            tags: tags,
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
                this.props.alert.show("Комментарий успешно сохранён");
            } else {
                log.info("comment " + this.state.commentId + " already existed");
            }
        });
    }

    onNewTagAddClicked = async (value) => {
        await this.withAlertError(async () => {
            const wasSaved = await rpc.callFromContentScript(
                "models/db.js",
                "createTagIfNotExists",
                [value],
            );

            if (wasSaved) {
                log.info("tag " + this.state.commentId + " saved successfully");
            } else {
                log.info("tag " + this.state.commentId + " already existed");
            }

            await this.updateTags();
        });
    };

    onTagDeleteClicked = async (tagName, index) => {
        await this.withAlertError(async () => {
            // TODO: show prompt asking if user is sure about this
            console.log("onTagDeleteClicked");
            const wasDeleted = await rpc.callFromContentScript(
                "models/db.js",
                "deleteTagById",
                [this.state.tags[index].id],
            );

            log.info("tag " + this.state.commentId + " deleted successfully");
            this.props.alert.show("Тег удалён успешно");
            await this.updateTags();
        });
    };

    onTagClicked = async (tag) => {
        await this.withAlertError(async () => {
            const wasSaved = await rpc.callFromContentScript(
                "models/db.js",
                "makePikabuCommentTagRelationIfNotExists",
                [this.state.commentId, tag.id]);

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
            this.props.alert.error(JSON.stringify(e));
            console.log(e);
            throw e;
        }
    };

    render() {
        return (
            <Paper>
                <ChipInput
                    alwaysShowPlaceholder={true}
                    lable={"Теги"}
                    onAdd={this.onNewTagAddClicked}
                    onDelete={this.onTagDeleteClicked}
                    placeholder={"Введите тег"}
                    value={this.state.tags.map(tag => tag.name)}
                    onUpdateInput={arg => {
                        console.log(arg);
                    }}
                />
            </Paper>
        )
    }
}

export default withAlert()(PikabuSaveCommentPopup);
