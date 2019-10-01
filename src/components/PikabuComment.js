import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import Paper from "@material-ui/core/Paper";
import {withAlert} from "react-alert";
import {Link} from "@material-ui/core";
import * as db from "../models/db";
import PikabuSaveCommentPopup from "./PikabuSaveCommentPopup";

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
        commentData: null,
    };

    componentDidMount() {
        this.setState({
            commentData: this.props.data,
        });
    }

    /*
    onAddTag = async (value) => {
        await db.createTagIfNotExists(value);
        const tag = (await db.getTagsByName(value))[0];
        const wasAdded = await db.makePikabuCommentTagRelationIfNotExists(this.state.commentData.id, tag.id);
        if (!wasAdded) {
            this.props.show("tag already existed");
        }
        await this.updateTags();
    };

    onDeleteTag = async (tagName, index) => {
        // TODO: show prompt asking if user is sure about this
        await db.removePikabuCommentTagRelation(this.state.commentData.id, this.state.commentData.tags[index].id);
        await this.updateTags();
    };
    */

    updateTags = async () => {
        const tags = await db.getAllTagsByPikabuCommentId(this.state.commentData.id);
        await this.setState(prevState => {
            prevState.commentData.tags = tags;
            return prevState;
        });
    };

    render() {
        const {classes} = this.props;

        return (this.state.commentData === null ? <p>Loading...</p> : <Paper
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
                {/*<span>*/}
                {/*    {*/}
                {/*    this.state.commentData.tags.map((tag, index) => {*/}
                {/*        return <span key={index}>{tag.name}</span>;*/}
                {/*    })*/}
                {/*}*/}
                {/*</span>*/}
            </header>
            <PikabuSaveCommentPopup
                commentId={this.state.commentData.id}
                commentData={this.state.commentData}
                showAllTagsOnlyWithInput={true}
            />
            {/*<ChipInput*/}
            {/*    alwaysShowPlaceholder={true}*/}
            {/*    lable={"Теги"Kristina Rose, тут один добрый пикабушник разработал приложуху, которая порнозвезд мониторит. И там, посмотрел, нихуя не любительское... Но тощая, но за то работе отдается вся.</p> }*/}
            {/*    onAdd={this.onAddTag}*/}
            {/*    onDelete={this.onDeleteTag}*/}
            {/*    placeholder={"Введите тег"}*/}
            {/*    value={this.state.commentData.tags.map(tag => tag.name)}*/}
            {/*/>*/}
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

