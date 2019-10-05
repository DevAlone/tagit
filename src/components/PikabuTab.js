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

const styles = () => ({
    root: {
        minHeight: 2000,
        padding: 10,
    },
    pikabuCommentContainer: {
        // width: "100%",
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
});

const NUMBER_OF_COMMENTS_PER_PAGE = 10;

class PikabuTab extends Component {
    state = {
        comments: [],
        tags: [],
        showOnlyCommentsWithoutTags: false,
        hasMoreComments: true,
        offset: 0,
    };

    componentDidMount() {
        document.getElementById("tagit__showOnlyCommentsWithoutTagsCheckbox").focus();
        window.addEventListener("keydown", async e => {
            if (e.key === "Escape") {
                await this.updateComments();
                const tagInput = document.querySelector(".tagit__pikabuSaveCommentPopupInput input");
                if (tagInput !== null) {
                    tagInput.focus();
                }
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

        log.debug("comments: ", pikabuComments);

        await this.setState(prevState => {
            prevState.comments = prevState.comments.concat(pikabuComments);
            prevState.offset += NUMBER_OF_COMMENTS_PER_PAGE;
            if (pikabuComments.length === 0) {
                prevState.hasMoreComments = false;
            }

            return prevState;
        });

        // await this.setState({
        //     comments: pikabuComments,
        // });
    };

    async updateComments() {
        await this.setState({
            comments: [],
            hasMoreComments: true,
            offset: 0,
        });
        await this.loadMoreComments();
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

    render() {
        const {classes} = this.props;
        const currentPath = this.props.location.pathname;

        return (
            <React.Fragment>
                <CssBaseline/>
                <TopBar currentPath={currentPath}/>
                <div className={classes.root}>
                    <p className={classes.updateHint}>Нажмите Escape, чтобы обновить страницу</p>
                    <h1>Комментарии:</h1>
                    <div>
                        <FormControlLabel
                            control={<Checkbox
                                id={"tagit__showOnlyCommentsWithoutTagsCheckbox"}
                                checked={this.state.showOnlyCommentsWithoutTags}
                                onChange={async e => {
                                    await this.setState({
                                        showOnlyCommentsWithoutTags: e.target.checked,
                                    });
                                    await this.updateComments();
                                }}
                                color={"primary"}

                            />}
                            label={"Только без тегов"}
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

