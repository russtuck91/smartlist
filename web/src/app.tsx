import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './app.scss';
import './app-old.css';
import { Navigation } from './navigation/navigation';
import { Home } from './home';
import { Account } from './account/account';
import { Login } from './login/login';
import { RouteLookup } from './core/routes/route-lookup';
import { PlaylistBrowser } from './playlists/playlist-browser/playlist-browser';
import { PlaylistBuilder } from './playlists/playlist-builder/playlist-builder';

export class App extends Component {
    render() {
        return (
            <div className="app">
                <BrowserRouter>
                    <>
                        <Navigation />
                        <div className="container">
                            <Switch>
                                <Route exact path={RouteLookup.playlists.create} component={PlaylistBuilder} />
                                <Route exact path={RouteLookup.playlists.base} component={PlaylistBrowser} />
                                <Route exact path={RouteLookup.login} component={Login} />
                                <Route exact path={RouteLookup.account} component={Account} />
                                <Route exact path={RouteLookup.home} component={Home} />
                            </Switch>
                        </div>
                    </>
                </BrowserRouter>
            </div>
        );
    }
}
