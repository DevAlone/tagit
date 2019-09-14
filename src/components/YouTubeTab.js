import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import TopBar from './TopBar';

const styles = theme => ({});

class YouTubeTab extends Component {
    state = {};

    componentDidMount() {
    }

    render() {
        const {classes} = this.props;
        const currentPath = this.props.location.pathname;

        return (
            <React.Fragment>
                <CssBaseline/>
                <TopBar currentPath={currentPath}/>
                <div className={classes.root}>
                    Coming not very soon...
                </div>
            </React.Fragment>
        )
    }
}

export default withRouter(withStyles(styles)(YouTubeTab));