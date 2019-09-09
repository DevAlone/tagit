import React from 'react'
import {Route, HashRouter, Switch} from 'react-router-dom'
import Home from './components/Home'
import Pikabu from './components/Pikabu'
import YouTube from './components/YouTube'
import ScrollToTop from "./components/ScrollTop";

export const routes = [
    {
        path: "/",
        component: Home,
    },
    {
        path: "/pikabu",
        component: Pikabu,
    },
    {
        path: "/youtube",
        component: YouTube,
    },
];

export default () => (
    <HashRouter>
        <ScrollToTop>
            <Switch>
                {
                    routes.map((obj, index) => {
                        return <Route exact path={obj.path} component={obj.component}/>;
                    })
                }
            </Switch>
        </ScrollToTop>
    </HashRouter>
)