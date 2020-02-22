import { Container, createMuiTheme, ThemeProvider } from '@material-ui/core';
import { teal } from '@material-ui/core/colors';
import React, { Component } from 'react';
import { Route, Router, Switch } from 'react-router';

import { Account } from './account/account';
import './app.scss';
import { history } from './core/history/history';
import { RouteLookup } from './core/routes/route-lookup';
import { Home } from './home';
import { Login } from './login/login';
import { LoginCallback } from './login/login-callback';
import { Navigation } from './navigation/navigation';
import { PlaylistContainer } from './playlists/playlist-container';

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
                    <Router history={history}>
                    <>
                        <Navigation />
                        <Container>
                            <Switch>
                                <Route path={RouteLookup.playlists.base} component={PlaylistContainer} />
                                <Route exact path={RouteLookup.login.callback} component={LoginCallback} />
                                <Route exact path={RouteLookup.login.login} component={Login} />
                                <Route exact path={RouteLookup.account} component={Account} />
                                <Route exact path={RouteLookup.home} component={Home} />
                            </Switch>
                        </Container>
                    </>
                    </Router>
                </ThemeProvider>
            </div>
        );
    }
}
