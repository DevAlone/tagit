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

const styles = theme => ({});

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
            // add prompt
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
                    pikabu:

                    Comments:
                    {
                        this.state.comments.map((comment, index) => {
                            // TODO: move to a component
                            return <Paper key={index}>
                                <Button onClick={async () => {
                                    await this.deletePikabuCommentById(comment.id)
                                }}>Удалить</Button>
                                <p>{comment.id}</p>
                                <p>{comment.commentLink}</p>
                                <p>{comment.storyId}</p>
                                <p>{comment.authorUsername}</p>
                                <p>{comment.createdAtDate}</p>
                                <p>{comment.contentHTML}</p>
                                <p>{comment.contentText}</p>
                                <div>{
                                    comment.contentImages.map((image, index) => {
                                        return <img src={image} key={index} alt={""}/>;
                                    })
                                }</div>
                                <div>{
                                    comment.tags.map((tag, index) => {
                                        return <span key={index}>{tag.name}</span>;
                                    })
                                }</div>
                            </Paper>;
                        })
                    }

                    Tags:
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
                </div>
            </React.Fragment>
        )
    }
}

export default withAlert()(withRouter(withStyles(styles)(PikabuTab)));

