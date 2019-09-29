import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import {withAlert} from "react-alert";
import {Link} from "@material-ui/core";

const styles = theme => ({});

class PikabuComment extends Component {
    state = {
        commentData: {
            id: 0,
            authorUsername: "",
            createdAtDate: "",
            contentHTML: "",
            contentText: "none",
            contentImages: [],
            tags: [],
        },
    };

    componentDidMount() {
        this.setState({
            commentData: this.props.data,
        });
    }

    render() {
        const {classes} = this.props;

        return (<Paper
            className={classes.paper}
        >
            <Link
                // href={"https://pikabu.ru/story/_" + this.state.commentData.storyId + "?cid=" + this.state.commentData.id}
                href={this.state.commentLink}
            >
                {this.state.commentLink}
            </Link>
            <header>@{this.state.commentData.authorUsername} {this.state.commentData.createdAtDate}</header>
            <h1>contentHTML:</h1>
            <p>{this.state.commentData.contentHTML}</p>
            <h1>contentText:</h1>
            <p>{this.state.commentData.contentText}</p>
            <div>{
                this.state.commentData.contentImages.map((image, index) => {
                    return <img
                        className={classes.pikabuCommentImage}
                        src={image}
                        key={index}
                        alt={""}
                    />;
                })
            }</div>
            <div>{
                this.state.commentData.tags.map((tag, index) => {
                    return <span key={index}>{tag.name}</span>;
                })
            }</div>
        </Paper>);
    }
}

export default withAlert()(withStyles(styles)(PikabuComment));

