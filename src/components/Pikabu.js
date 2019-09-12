import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter, Link} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TopBar from './TopBar';

import * as db from "../models/db";
import * as log from "../misc/log";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import {withAlert} from "react-alert";

const numeral = require('numeral');
numeral.defaultFormat('0,000');

const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.grey['100'],
        overflow: 'hidden',
        backgroundSize: 'cover',
        backgroundPosition: '0 400px',
        paddingBottom: 200
    },
    grid: {
        width: 1200,
        margin: `0 ${theme.spacing(2)}px`,
        [theme.breakpoints.down('sm')]: {
            width: 'calc(100% - 20px)'
        }
    },
    loadingState: {
        opacity: 0.05
    },
    paper: {
        padding: theme.spacing(3),
        margin: theme.spacing(2),
        textAlign: 'left',
        color: theme.palette.text.secondary
    },
    rangeLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: theme.spacing(2)
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    outlinedBottom: {
        textTransform: 'uppercase',
        margin: theme.spacing(1)
    },
    actionBottom: {
        textTransform: 'uppercase',
        margin: theme.spacing(1),
        width: 152,
        height: 36
    },
    blockCenter: {
        padding: theme.spacing(2),
        textAlign: 'center'
    },
    block: {
        padding: theme.spacing(2),
    },
    loanAvatar: {
        display: 'inline-block',
        verticalAlign: 'center',
        width: 16,
        height: 16,
        marginRight: 10,
        marginBottom: -2,
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main
    },
    interestAvatar: {
        display: 'inline-block',
        verticalAlign: 'center',
        width: 16,
        height: 16,
        marginRight: 10,
        marginBottom: -2,
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.light
    },
    inlining: {
        display: 'inline-block',
        marginRight: 10
    },
    buttonBar: {
        display: 'flex'
    },
    noBorder: {
        borderBottomStyle: 'hidden'
    },
    mainBadge: {
        textAlign: 'center',
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4)
    }
});

class Pikabu extends Component {
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
            comments: await db.getAllPikabuComments(),
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
                                <Button onClick={async () => {await this.deletePikabuCommentById(comment.id)}}>Удалить</Button>
                                <p>{comment.id}</p>
                                <p>{comment.commentLink}</p>
                                <p>{comment.storyId}</p>
                                <p>{comment.authorUsername}</p>
                                <p>{comment.createdAtDate}</p>
                                <p>{comment.contentHTML}</p>
                                <p>{comment.contentText}</p>
                                <div>{
                                    comment.contentImages.map((image, index) => {
                                        return <img src={image} key={index}/>;
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
                                <Button onClick={async () => {await this.deleteTagById(tag.id)}}>Удалить</Button>
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

export default withAlert()(withRouter(withStyles(styles)(Pikabu)));
