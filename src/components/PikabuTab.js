import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TopBar from './TopBar';

import * as db from "../models/db";
import * as log from "../misc/log";
import Button from "@material-ui/core/Button";
import {withAlert} from "react-alert";
import Grid from "@material-ui/core/Grid";
import PikabuComment from "./PikabuComment";
import {Checkbox} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const styles = () => ({
    pikabuCommentContainer: {
        width: "100%",
        padding: "5px 10px",
    },
    pikabuComment: {},
    pikabuCommentDeleteButtonContainer: {
        display: "flex",
        justifyContent: "flex-end",
    },
    updateHint: {
        color: "#888",
    }
});

class PikabuTab extends Component {
    state = {
        comments: [],
        tags: [],
        showOnlyCommentsWithoutTags: false,
    };

    componentDidMount() {
        this.updateAll();
        document.getElementById("tagit__showOnlyCommentsWithoutTagsCheckbox").focus();
        window.addEventListener("keydown", async e => {
            if (e.key === "Escape") {
                await this.updateAll();
                const tagInput = document.querySelector(".tagit__pikabuSaveCommentPopupInput input");
                if (tagInput !== null) {
                    tagInput.focus();
                }
            }
        });
    }

    async updateAll() {
        // await this.updateTags();
        await this.updateComments();
    }

    async updateComments() {
        // let pikabuComments = await db.getAllPikabuComments(true);
        let pikabuComments = await db.getPikabuComments(
            "id",
            false,
            this.state.showOnlyCommentsWithoutTags,
            true,
            10,
            0,
        );

        pikabuComments = pikabuComments.filter(comment => {
            return !this.state.showOnlyCommentsWithoutTags || comment.tags.length === 0;
        });

        log.debug(pikabuComments);

        await this.setState({
            comments: pikabuComments,
        });
    }

    async updateTags() {
        await this.setState({
            tags: await db.getAllTags(),
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
                    <Grid
                        container
                        direction="row"
                        justify="space-around"
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
                </div>
            </React.Fragment>
        )
    }
}

export default withAlert()(withRouter(withStyles(styles)(PikabuTab)));

