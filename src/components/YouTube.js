import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter, Link} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/lab/Slider';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import Loading from './common/Loading';

import TopBar from './TopBar';

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
    outlinedButtom: {
        textTransform: 'uppercase',
        margin: theme.spacing(1)
    },
    actionButtom: {
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

class YouTube extends Component {
    state = {
    };

    componentDidMount() {
    }

    render() {
        const {classes} = this.props;
        const {
            amount, period, start, monthlyPayment,
            monthlyInterest, data, loading
        } = this.state;
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

export default withRouter(withStyles(styles)(YouTube));