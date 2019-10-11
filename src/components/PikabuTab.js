import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TopBar from './TopBar';
import InfiniteScroll from 'react-infinite-scroller';
import * as db from "../models/db";
import * as log from "../misc/log";
import Button from "@material-ui/core/Button";
import {withAlert} from "react-alert";
import Grid from "@material-ui/core/Grid";
import PikabuComment from "./PikabuComment";
import {Checkbox} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Input from "@material-ui/core/Input";
import ChromeWarning from "./ChromeWarning";

const styles = () => ({
    root: {
        minHeight: 2000,
        padding: 10,
    },
    pikabuCommentContainer: {
        maxWidth: "1000px",
        padding: "5px 10px",
    },
    pikabuComment: {},
    pikabuCommentDeleteButtonContainer: {
        display: "flex",
        justifyContent: "flex-end",
    },
    updateHint: {
        color: "#888",
    },
    tagsSearch: {
        display: "flex",
    },
    tagsSearchInput: {
        flexGrow: 1,
    },
});

const NUMBER_OF_COMMENTS_PER_PAGE = 10;

class PikabuTab extends Component {
    state = {
        comments: [],
        showOnlyCommentsWithoutTags: false,
        hasMoreComments: true,
        offset: 0,
        searchText: "",
    };

    componentDidMount() {
        document.getElementById("tagit__showOnlyCommentsWithoutTagsCheckbox").focus();
        window.addEventListener("keydown", async e => {
            if (e.key === "Escape") {
                await this.updateComments();
                setTimeout(() => {
                    let tagInput = document.querySelector(".tagit__pikabuSaveCommentPopupInput input");
                    if (tagInput !== null) {
                        tagInput.focus();
                    } else {
                        log.error("unable to focus, tagInput is null");
                    }
                }, 250);
            }
        });
    }

    loadMoreComments = async () => {
        let pikabuComments = await db.getPikabuComments(
            "id",
            false,
            this.state.showOnlyCommentsWithoutTags,
            true,
            NUMBER_OF_COMMENTS_PER_PAGE,
            this.state.offset,
        );

        const hasMoreComments = pikabuComments.length > 0;

        const searchText = this.state.searchText.trim();

        if (searchText.length > 0) {
            pikabuComments = pikabuComments.filter(comment => {
                for (const tag of comment.tags) {
                    if (tag.name.toLowerCase().includes(this.state.searchText)) {
                        return true;
                    }
                }
                return false;
            });
        }

        log.debug("comments: ", pikabuComments);

        await this.setState(prevState => {
            prevState.comments = prevState.comments.concat(pikabuComments);
            prevState.offset += NUMBER_OF_COMMENTS_PER_PAGE;
            prevState.hasMoreComments = hasMoreComments;

            return prevState;
        });
    };

    async updateComments() {
        await this.setState({
            comments: [],
            hasMoreComments: true,
            offset: 0,
        });
    }

    async deletePikabuCommentById(id) {
        try {
            if (!window.confirm("Вы уверены, что хотите удалить комментарий " + id + " и снять с него все теги?")) {
                return;
            }
            await db.deletePikabuCommentById(id);
            this.props.alert.info("deleted successfully");
            await this.updateComments();
        } catch (e) {
            log.error(e);
            if (e.hasOwnProperty("message")) {
                this.props.alert.error(e.message);
            } else {
                this.props.alert.error(JSON.stringify(e));
            }
            throw e;
        }
    }

    onWithoutTagsCheckboxChanged = async (e) => {
        const isChecked = e.target.checked;
        await this.setState({
            showOnlyCommentsWithoutTags: isChecked,
        });
        if (isChecked) {
            await this.setState({
                searchText: "",
            });
        }
        await this.updateComments();
    };

    onSearchTextChangedTimeoutHandle = null;
    onSearchTextChanged = (e) => {
        const searchText = e.target.value;

        (async () => {
            await this.setState({
                searchText: searchText,
            });

            if (this.onSearchTextChangedTimeoutHandle !== null) {
                clearTimeout(this.onSearchTextChangedTimeoutHandle);
            }
            this.onSearchTextChangedTimeoutHandle = setTimeout(async () => {
                if (this.state.searchText.length > 0) {
                    await this.setState({
                        showOnlyCommentsWithoutTags: false,
                    });
                }
                await this.updateComments();
                this.onSearchTextChangedTimeoutHandle = null;
            }, 400);
        })();
    };

    render() {
        const {classes} = this.props;
        const currentPath = this.props.location.pathname;

        return (
            <React.Fragment>
                <CssBaseline/>
                <TopBar currentPath={currentPath}/>
                <div className={classes.root}>
                    <ChromeWarning/>
                    <p className={classes.updateHint}>Нажмите Escape, чтобы обновить страницу</p>
                    <h1>Комментарии:</h1>
                    <div className={classes.tagsSearch}>
                        <FormControlLabel
                            control={<Checkbox
                                id={"tagit__showOnlyCommentsWithoutTagsCheckbox"}
                                checked={this.state.showOnlyCommentsWithoutTags}
                                onChange={this.onWithoutTagsCheckboxChanged}
                                color={"primary"}

                            />}
                            label={"Только без тегов"}
                        />
                        <Input
                            className={classes.tagsSearchInput}
                            value={this.state.searchText}
                            onChange={this.onSearchTextChanged}
                            placeholder={"Введите тег для поиска"}
                        />
                    </div>

                    <InfiniteScroll
                        pageStart={0}
                        loadMore={this.loadMoreComments}
                        hasMore={this.state.hasMoreComments}
                        loader={<div key={0}>
                            Загружаем комментарии...
                        </div>}
                    >
                        <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="stretch"
                        >
                            {
                                this.state.comments.map((comment, index) => {
                                    return (<div
                                        className={classes.pikabuCommentContainer}
                                        key={comment.id}
                                    >
                                        <div className={classes.pikabuCommentDeleteButtonContainer}>
                                            <Button
                                                onClick={async () => {
                                                    await this.deletePikabuCommentById(comment.id)
                                                }}>
                                                Удалить
                                            </Button>
                                        </div>
                                        <PikabuComment
                                            className={classes.pikabuComment}
                                            data={comment} key={index}
                                        />
                                    </div>);
                                })
                            }
                        </Grid>
                    </InfiniteScroll>
                </div>
            </React.Fragment>
        )
    }
}

export default withAlert()(withRouter(withStyles(styles)(PikabuTab)));

