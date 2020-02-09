import { Container, createMuiTheme, ThemeProvider } from '@material-ui/core';
import { teal } from '@material-ui/core/colors';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { Account } from './account/account';
import './app.scss';
import { RouteLookup } from './core/routes/route-lookup';
import { Home } from './home';
import { Login } from './login/login';
import { LoginCallback } from './login/login-callback';
import { Navigation } from './navigation/navigation';
import { PlaylistBrowser } from './playlists/playlist-browser/playlist-browser';
import { PlaylistBuilder } from './playlists/playlist-builder/playlist-builder';

export class App extends Component {
    render() {
        const theme = createMuiTheme({
            palette: {
                type: 'dark',
                primary: teal
            },
            overrides: {
                MuiInputBase: {
                    root: {
                        width: '100%'
                    }
                }
            }
        });

        return (
            <div className="app">
                <ThemeProvider theme={theme}>
                    <BrowserRouter>
                    <>
                        <Navigation />
                        <Container>
                            <Switch>
                                <Route exact path={RouteLookup.playlists.create} component={PlaylistBuilder} />
                                <Route exact path={RouteLookup.playlists.base} component={PlaylistBrowser} />
                                <Route exact path={RouteLookup.login.callback} component={LoginCallback} />
                                <Route exact path={RouteLookup.login.login} component={Login} />
                                <Route exact path={RouteLookup.account} component={Account} />
                                <Route exact path={RouteLookup.home} component={Home} />
                            </Switch>
                        </Container>
                    </>
                    </BrowserRouter>
                </ThemeProvider>
            </div>
        );
    }
}
