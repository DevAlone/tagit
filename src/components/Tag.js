import React, {Component} from 'react';
import * as db from "../models/db";
import * as log from "../misc/log";
import {withAlert} from "react-alert";
import Chip from "@material-ui/core/Chip";

class Tag extends Component {
    deleteThisTag = async () => {
        try {
            // add prompt
            await db.deleteTagById(this.props.tagData.id);
            this.props.alert.info("deleted successfully");
            this.props.onDelete();
            return true;
        } catch (e) {
            log.error(e);
            if (e.hasOwnProperty("message")) {
                this.props.alert.error(e.message);
            } else {
                this.props.alert.error(JSON.stringify(e));
            }
            return false;
        }
    };

    render() {
        return (
            <Chip
                label={this.props.tagData.name}
                onDelete={this.deleteThisTag}
            />
        )
    }
}

export default withAlert()(Tag);
