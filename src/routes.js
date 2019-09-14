import React from 'react'
import {Route, HashRouter, Switch} from 'react-router-dom'
import HomeTab from './components/HomeTab'
import PikabuTab from './components/PikabuTab'
import YouTubeTab from './components/YouTubeTab'
import TagsTab from './components/TagsTab'
import SettingsTab from './components/SettingsTab'
import ScrollToTop from "./components/ScrollTop";

export const routes = [
    {
        path: "/",
        component: HomeTab,
    },
    {
        path: "/pikabu",
        component: PikabuTab,
    },
    {
        path: "/youtube",
        component: YouTubeTab,
    },
    {
        path: "/tags",
        component: TagsTab,
    },
    {
        path: "/settings",
        component: SettingsTab,
    },
];

export default () => (
    <HashRouter>
        <ScrollToTop>
            <Switch>
                {
                    routes.map((obj, index) => {
                        return <Route exact path={obj.path} component={obj.component} key={index}/>;
                    })
                }
            </Switch>
        </ScrollToTop>
    </HashRouter>
)