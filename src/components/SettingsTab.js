import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TopBar from './TopBar';

import * as db from "../models/db";
import * as log from "../misc/log";
import Button from "@material-ui/core/Button";
import {withAlert} from "react-alert";

const styles = theme => ({
});

class SettingsTab extends Component {
    state = {
    };

    componentDidMount() {
    }

    async dropDatabase() {
        try {
            if (!window.confirm("Вы уверены, что хотите удалить ВСЁ?")) {
                return;
            }
            await db.dropDatabase();
            this.props.alert.info("deleted successfully");
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
                    <Button onClick={async () => {await this.dropDatabase()}}>Удалить базу данных</Button>
                </div>
            </React.Fragment>
        )
    }
}

export default withAlert()(withRouter(withStyles(styles)(SettingsTab)));
