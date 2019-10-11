import React from 'react';
import {withAlert} from "react-alert";
import withStyles from "@material-ui/core/styles/withStyles";
import Icon from "@material-ui/core/Icon";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";
import {amber} from "@material-ui/core/colors";

const styles = () => ({
    warningIcon: {
        color: amber[700],
    },
    paper: {
        display: "flex",
        flexWrap: "no-wrap",
        alignItems: "center",
        padding: 10,
    },
    message: {
        marginLeft: 10,
    }
});

class ChromeWarning extends React.Component {
    render() {
        const {classes} = this.props;

        return (/Chrome/.test(window.navigator.userAgent) ?
                <Paper className={classes.paper}>
                    <Icon className={classes.warningIcon}>warning</Icon>
                    <div className={classes.message}>
                        <p>Вы используете хром, поэтому существующие комментарии надо загрузить вручную,
                            перейдя по следующей ссылке:</p>
                        <Link
                            href={"https://pikabu.ru/information/contacts#special_url_for_tagit_iengekou1Chai4Ese1EPei9seehee0oe"}
                            target={"_blank"}
                        >
                            https://pikabu.ru/information/contacts#special_url_for_tagit_iengekou1Chai4Ese1EPei9seehee0oe
                        </Link>
                        <p>Новые комментарии будут добавляться автоматически.
                            В одном из следующих релизов хрома проблема будет устранена
                            и комментарии будут загружаться с помощью магии :)</p>
                    </div>
                </Paper>
                : <div></div>
        );
    }
}

export default withAlert()(withStyles(styles)(ChromeWarning));
