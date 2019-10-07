import React from 'react';
import * as rpc from "../misc/rpc";
import * as log from "../misc/log";
import {withAlert} from "react-alert";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = theme => ({
    searchBar: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-between",
        alignItems: "stretch",
        alignContent: "stretch",
        borderBottom: "1px solid #999",
        marginTop: 2,
        marginBottom: 2,
    },
    inputField: {
        flexGrow: 1,
    },
    addNewTagButton: {},
    tag: {
        margin: 1,
    },
});

class PikabuSaveCommentPopup extends React.Component {
    state = {
        commentId: 0,
        commentData: 0,
        allTags: [],
        commentTags: [],
        inputText: "",
    };

    async componentDidMount() {
        if (this.props.commentId !== null) {
            await this.setState({
                commentId: this.props.commentId,
            });
        }
        if (this.props.commentData !== null) {
            await this.setState({
                commentData: this.props.commentData,
            });
        }
        this.updateTags();
    }

    async updateTags() {
        const commentTags = await rpc.callFromContentScript(
            "models/db.js",
            "getAllTagsByPikabuCommentId",
            [this.state.commentId],
        );
        await this.setState({
            commentTags: commentTags,
        });

        const commentTagIdsSet = new Set(commentTags.map(tag => tag.id));

        const searchText = this.state.inputText.trim();

        if (this.props.showAllTagsOnlyWithInput && searchText.length === 0) {
            this.setState({
                allTags: [],
            });
            return;
        }

        let tags = [];

        if (searchText.length === 0) {
            tags = await rpc.callFromContentScript(
                "models/db.js",
                "getAllTags",
                []
            );
        } else {
            tags = await rpc.callFromContentScript(
                "models/db.js",
                "searchTagsByName",
                [searchText],
            );
        }
        tags = tags.filter(tag => !commentTagIdsSet.has(tag.id));

        await this.setState({
            allTags: tags,
        });
    }

    async onShown() {
        await this.withAlertError(async () => {
            await this.setState({
                inputText: "",
            });
            await this.updateTags();
            const wasSaved = await rpc.callFromContentScript(
                "models/db.js",
                "createPikabuCommentIfNotExists",
                [
                    this.state.commentId,
                    this.state.commentData.commentLink,
                    this.state.commentData.storyId,
                    this.state.commentData.authorUsername,
                    this.state.commentData.createdAtDate,
                    this.state.commentData.contentHTML,
                    this.state.commentData.contentText,
                    this.state.commentData.contentImages,
                ],
            );

            if (wasSaved) {
                log.info("comment " + this.state.commentId + " saved successfully");
                this.props.alert.show("Комментарий успешно сохранён");
            } else {
                log.info("comment " + this.state.commentId + " already existed");
            }
        });
    }

    onNewTagAddClicked = async () => {
        if (this.state.inputText.trim().length === 0) {
            return;
        }

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

        const tags = await rpc.callFromContentScript(
            "models/db.js",
            "getTagsByName",
            [this.state.inputText],
        );

        console.log(tags);

        await this.onTagClicked(tags[0]);

        await this.setState({
            inputText: "",
        });

        await this.updateTags();
    };

    onInputChanged = async (event) => {
        await this.setState({
            inputText: event.target.value,
        });
        // TODO: debounce?
        await this.updateTags();
    };

    onKeyDown = async (event) => {
        if (event.keyCode === 13) {
            await this.onNewTagAddClicked();
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
                [this.state.commentId, tag.id]
            );

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
        await this.withAlertError(async () => {
            const wasUntagged = await rpc.callFromContentScript(
                "models/db.js",
                "removePikabuCommentTagRelation",
                [this.state.commentId, tag.id]
            );

            if (wasUntagged) {
                log.info("tag comment relation " + this.state.commentId + ":" + tag.id + " deleted successfully");
            } else {
                log.info("tag comment relation " + this.state.commentId + ":" + tag.id + " did not delete");
            }

            await this.updateTags();
        });
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
        const {classes} = this.props;

        return (
            <div>
                <p>Текущие теги</p>
                <div>
                    {
                        this.state.commentTags.map((tag, index) => {
                            return <Chip
                                className={classes.tag}
                                key={index}
                                label={tag.name}
                                onDelete={async () => {
                                    await this.untagCurrentComment(tag);
                                }}
                            />;
                        })
                    }
                </div>
                <div className={classes.searchBar}>
                    <Input
                        id={"tagit__pikabuSaveCommentPopupInput"}
                        className={`${classes.inputField} tagit__pikabuSaveCommentPopupInput`}
                        disableUnderline={true}
                        value={this.state.inputText}
                        onChange={this.onInputChanged}
                        onKeyDown={this.onKeyDown}
                        placeholder={"Введите тег и нажмите Enter"}
                    />
                    <Button
                        className={classes.addNewTagButton}
                        color={"primary"}
                        onClick={this.onNewTagAddClicked}
                        tabIndex={"-1"}
                    >
                        +
                    </Button>
                </div>
                <div>
                    {
                        this.state.allTags.map((tag, index) => {
                            return <Chip
                                className={classes.tag}
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
            </div>
        )
    }
}

export default withAlert()(withStyles(styles)(PikabuSaveCommentPopup));
