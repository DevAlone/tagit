import React from 'react';
import Paper from "@material-ui/core/Paper";
import * as rpc from "../misc/rpc";
import * as log from "../misc/log";
import {withAlert} from "react-alert";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";

class PikabuSaveCommentPopup extends React.Component {
    state = {
        commentId: 0,
        commentData: 0,
        allTags: [],
        commentTags: [],
        inputText: "",
    };

    async componentDidMount() {
        await this.updateTags();
    }

    async updateTags() {
        const tags = await rpc.callFromContentScript("models/db.js", "getAllTags", []);
        await this.setState({
            allTags: tags,
        });
        const commentTags = await rpc.callFromContentScript(
            "models/db.js",
            "getAllTagsByCommentId",
            [this.state.commentId],
        );
        await this.setState({
            commentTags: commentTags,
        });
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

    onNewTagAddClicked = async () => {
        await this.withAlertError(async () => {
            const wasSaved = await rpc.callFromContentScript(
                "models/db.js",
                "createTagIfNotExists",
                [this.state.inputText],
            );

            if (wasSaved) {
                log.info("tag " + this.state.inputText + " saved successfully");
            } else {
                log.info("tag " + this.state.inputText + " already existed");
            }

            await this.updateTags();
        });
    };

    onInputChanged = async (event) => {
        await this.setState({
            inputText: event.target.value,
        });
        // TODO: add filtering
    };

    onKeyDown = async (event) => {
        if (event.keyCode === 13) {
            await this.onNewTagAddClicked;
        }
    };

    onTagDeleteClicked = async (tagName, index) => {
        await this.withAlertError(async () => {
            if (!window.confirm("Вы уверены, что хотите удалить тег " + tagName + " и снять его со всех комментариев?")) {
                return;
            }
            const wasDeleted = await rpc.callFromContentScript(
                "models/db.js",
                "deleteTagById",
                [this.state.allTags[index].id],
            );

            if (wasDeleted) {
                log.info("tag " + this.state.commentId + " deleted successfully");
                this.props.alert.show("Тег удалён успешно");
            } else {
                log.info("tag " + this.state.commentId + " was not deleted");
                this.props.alert.show("Тег не был удалён");
            }

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

    untagCurrentComment = async (tag) => {
        console.log("untagging tag ", tag);
    };

    withAlertError = async (func) => {
        try {
            return await func();
        } catch (e) {
            this.props.alert.error(JSON.stringify(e));
            log.error(e);
            throw e;
        }
    };

    render() {
        return (
            <Paper>
                <div>list of current tags:</div>
                <div>
                    {
                        this.state.commentTags.map((tag, index) => {
                            return <Chip
                                key={index}
                                label={tag.name}
                                onClick={async () => {
                                    await this.untagCurrentComment(tag);
                                }}
                                onDelete={async () => {
                                    await this.untagCurrentComment(tag);
                                }}
                            />;
                        })
                    }
                </div>
                <Input
                    autoFocus={true}
                    onChange={this.onInputChanged}
                    onKeyDown={this.onKeyDown}
                />
                <Button
                    color={"primary"}
                    onClick={this.onNewTagAddClicked}
                >
                    +
                </Button>
                <div>list of all tags except current</div>
                <div>
                    {
                        this.state.allTags.map((tag, index) => {
                            return <Chip
                                key={index}
                                label={tag.name}
                                onClick={async () => {
                                    await this.onTagClicked(tag);
                                }}
                                onDelete={async () => {
                                    await this.onTagDeleteClicked(tag.name, index);
                                }}
                            />;
                        })
                    }
                </div>
                {/*<ChipInput*/}
                {/*    alwaysShowPlaceholder={true}*/}
                {/*    lable={"Теги"}*/}
                {/*    onAdd={this.onNewTagAddClicked}*/}
                {/*    onDelete={this.onTagDeleteClicked}*/}
                {/*    placeholder={"Введите тег"}*/}
                {/*    value={this.state.allTags.map(tag => tag.name)}*/}
                {/*    onUpdateInput={arg => {*/}
                {/*        console.log(arg);*/}
                {/*    }}*/}
                {/*/>*/}
            </Paper>
        )
    }
}

export default withAlert()(PikabuSaveCommentPopup);
