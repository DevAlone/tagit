import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import {withAlert} from "react-alert";
import {Link} from "@material-ui/core";

const styles = () => ({
    paper: {
        padding: 10,
    },
    header: {
        "& *": {
            marginRight: "3px",
        }
    },
    createdAtDate: {
        color: "#999",
    },
    pikabuCommentImagesContainer: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        alignItems: "center",
        alignContent: "center",
    },
    pikabuCommentImage: {
        maxWidth: "100%",
        height: "300px",
    },
});

class PikabuComment extends Component {
    state = {
        commentData: {
            id: 0,
            commentLink: "",
            storyId: 0,
            authorUsername: "",
            createdAtDate: "",
            contentHTML: "",
            contentText: "none",
            contentImages: [],
            tags: [],
        },
    };

    componentDidMount() {
        console.log(this.props.data);
        this.setState({
            commentData: this.props.data,
        });
    }

    render() {
        const {classes} = this.props;

        return (<Paper
            className={classes.paper}
        >
            <header className={classes.header}>
                <Link
                    href={this.state.commentData.commentLink}
                >
                    Ссылка
                </Link>
                <span>@{this.state.commentData.authorUsername}</span>
                <span className={classes.createdAtDate}>{this.state.commentData.createdAtDate}</span>
                <span>{
                    this.state.commentData.tags.map((tag, index) => {
                        return <span key={index}>{tag.name}</span>;
                    })
                }</span>
            </header>
            <p>{this.state.commentData.contentText}</p>
            <div
                className={classes.pikabuCommentImagesContainer}
            >{
                this.state.commentData.contentImages.map((image, index) => {
                    return <img
                        className={classes.pikabuCommentImage}
                        src={image}
                        key={index}
                        alt={""}
                    />;
                })
            }</div>
        </Paper>);
    }
}

export default withAlert()(withStyles(styles)(PikabuComment));

