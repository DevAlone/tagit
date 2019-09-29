import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TopBar from './TopBar';

import * as db from "../models/db";
import * as log from "../misc/log";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import {withAlert} from "react-alert";
import Grid from "@material-ui/core/Grid";
import PikabuComment from "./PikabuComment";

const styles = theme => ({
    paper: {
        maxWidth: 600,
        padding: 2,
        margin: 2,
    },
    pikabuCommentImage: {
        width: "100%",
        background: "red",
    },
});

class PikabuTab extends Component {
    state = {
        comments: [],
        tags: [],
    };

    componentDidMount() {
        return this.updateAll();
    }

    async updateAll() {
        await this.updateTags();
        await this.updateComments();
    }

    async updateComments() {
        await this.setState({
            comments: await db.getAllPikabuComments(true),
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
            await db.deleteTagById(id);
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
        }
    }

    async deleteTagById(id) {
        try {
            if (!window.confirm("Вы уверены, что хотите удалить тег " + id + " и снять его со всех комментариев?")) {
                return;
            }
            await db.deleteTagById(id);
            this.props.alert.info("deleted successfully");
            await this.updateTags();
        } catch (e) {
            log.error(e);
            if (e.hasOwnProperty("message")) {
                this.props.alert.error(e.message);
            } else {
                this.props.alert.error(JSON.stringify(e));
            }
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
                    <h1>Комментарии:</h1>
                    <Grid
                        container
                        direction="row"
                        justify="space-around"
                        alignItems="stretch"
                    >
                        {
                            this.state.comments.map((comment, index) => {
                                return (<div key={index}>
                                    <Button onClick={async () => {
                                        await this.deletePikabuCommentById(comment.id)
                                    }}>Удалить</Button>
                                    <PikabuComment data={comment} key={index}/>
                                </div>);
                            })
                        }
                    </Grid>

                    <h1>Tags:</h1>
                    <Grid
                        container
                        direction="row"
                        justify="space-around"
                        alignItems="stretch"
                    >
                        {
                            this.state.tags.map((tag, index) => {
                                // TODO: move to a component
                                return <Paper key={index}>
                                    <Button onClick={async () => {
                                        await this.deleteTagById(tag.id)
                                    }}>Удалить</Button>
                                    <p>{tag.id}</p>
                                    <p>{tag.name}</p>
                                </Paper>;
                            })
                        }
                    </Grid>
                </div>
            </React.Fragment>
        )
    }
}

export default withAlert()(withRouter(withStyles(styles)(PikabuTab)));

