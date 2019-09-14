import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TopBar from './TopBar';

import * as db from "../models/db";
import {withAlert} from "react-alert";
import Paper from "@material-ui/core/Paper";
import ChipInput from "material-ui-chip-input";

const styles = () => ({
    root: {
        margin: 10,
        padding: 10,
    },
});

class TagsTab extends Component {
    state = {
        tags: [],
    };

    componentDidMount() {
        this.updateTags();
    }

    updateTags = async () => {
        await this.setState({
            tags: await db.getAllTags(),
        });
    };

    onAdd = async (value) => {
        // TODO: check if tag exists and show a message
        await db.createTagIfNotExists(value);
        await this.updateTags();
    };

    onDelete = async (tagName, index) => {
        // TODO: show prompt asking if user is sure about this
        await db.deleteTagById(this.state.tags[index].id);
        await this.updateTags();
    };

    render() {
        const {classes} = this.props;
        const currentPath = this.props.location.pathname;

        return (
            <React.Fragment>
                <CssBaseline/>
                <TopBar currentPath={currentPath}/>
                <Paper className={classes.root}>
                    <ChipInput
                        alwaysShowPlaceholder={true}
                        lable={"Теги"}
                        onAdd={this.onAdd}
                        onDelete={this.onDelete}
                        placeholder={"Введите тег"}
                        value={this.state.tags.map(tag => tag.name)}
                    />
                </Paper>
            </React.Fragment>
        )
    }
}

export default withAlert()(withRouter(withStyles(styles)(TagsTab)));
