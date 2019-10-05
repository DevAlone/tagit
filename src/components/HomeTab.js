import React, {Component} from 'react';
import withStyles from '@material-ui/styles/withStyles';
import {withRouter} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import TopBar from './TopBar';
import Link from "@material-ui/core/Link";

const styles = theme => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.grey['100'],
        overflow: 'hidden',
        backgroundSize: 'cover',
        backgroundPosition: '0 400px',
        padding: 10,
    },
    grid: {
        width: 1200,
        marginTop: 40,
        [theme.breakpoints.down('sm')]: {
            width: 'calc(100% - 20px)'
        }
    },
    paper: {
        padding: theme.spacing(3),
        textAlign: 'left',
        color: theme.palette.text.secondary,
    },
    rangeLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: theme.spacing(2)
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32
    },
    blockCenter: {
        padding: theme.spacing(2),
        textAlign: 'center'
    },
    block: {
        padding: theme.spacing(2),
    },
    box: {
        marginBottom: 40,
        height: 65
    },
    inlining: {
        display: 'inline-block',
        marginRight: 10
    },
    buttonBar: {
        display: 'flex'
    },
    alignRight: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    noBorder: {
        borderBottomStyle: 'hidden'
    },
    loadingState: {
        opacity: 0.05
    },
    loadingMessage: {
        position: 'absolute',
        top: '40%',
        left: '40%'
    }
});

class HomeTab extends Component {
    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <CssBaseline/>
                <TopBar/>
                <div className={classes.root}>
                    <Grid container justify="center">
                        <Grid spacing={4} alignItems="center" justify="center" container className={classes.grid}>
                            <Grid container item xs={12}>
                                <Grid item xs={12}>
                                    <Paper className={classes.paper}>
                                        <div className={classes.box}>
                                            <Typography color='secondary' gutterBottom>
                                                Tagit
                                            </Typography>
                                            <Typography variant="body1" gutterBottom>
                                                Tagit - расширение, позволяющее ставить теги на комментарии Пикабу и
                                                искать по ним.
                                            </Typography>
                                            <Typography>
                                                Репозиторий на GitHub
                                                <span> </span>
                                                <Link
                                                    href={"https://github.com/DevAlone/tagit"}
                                                    rel="noopener"
                                                    target="_blank"
                                                >
                                                    https://github.com/DevAlone/tagit
                                                </Link>
                                            </Typography>
                                            <Typography>
                                                Информация об обновлениях
                                                <span> </span>
                                                <Link
                                                    href={"https://pikabu.ru/@NeAdminPikabu"}
                                                    rel="noopener"
                                                    target="_blank"
                                                >
                                                    https://pikabu.ru/@NeAdminPikabu
                                                </Link>
                                            </Typography>
                                        </div>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </React.Fragment>
        )
    }
}

export default withRouter(withStyles(styles)(HomeTab));
