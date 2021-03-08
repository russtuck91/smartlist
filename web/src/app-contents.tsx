
import { StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { Route, Switch } from 'react-router';

import { RouteLookup } from './core/routes/route-lookup';

import { Account } from './account/account';
import { Home } from './home';
import { IndexRouter } from './index-router';
import { Login } from './login/login';
import { LoginCallback } from './login/login-callback';
import { Logout } from './login/logout';
import { Navigation } from './navigation/navigation';
import { PlaylistContainer } from './playlists/playlist-container';

interface AppContentsProps {}

const useStyles = (theme: Theme): StyleRules => ({
    root: {
        display: 'flex',
        flex: '1 1 auto',
        overflowY: 'auto',
        flexDirection: isMobile ? 'column-reverse' : 'column',
    },
    mainContents: {
        display: 'flex',
        flex: '1 1 auto',
        overflowY: 'auto',
        paddingBottom: theme.spacing(2),
    },
});

type FullProps = AppContentsProps & WithStyles<typeof useStyles>;

export class RawAppContents extends React.Component<FullProps> {
    render() {
        return (
            <div className={this.props.classes.root}>
                <Navigation />
                <div className={this.props.classes.mainContents}>
                    <Switch>
                        <Route path={RouteLookup.playlists.base} component={PlaylistContainer} />

                        <Route exact path={RouteLookup.login.callback} component={LoginCallback} />
                        <Route path={RouteLookup.login.login} component={Login} />
                        <Route exact path={RouteLookup.logout} component={Logout} />

                        <Route exact path={RouteLookup.account} component={Account} />
                        <Route exact path={RouteLookup.home} component={Home} />
                        <Route path={RouteLookup.index} component={IndexRouter} />
                    </Switch>
                </div>
            </div>
        );
    }
}

export const AppContents = withStyles(useStyles)(RawAppContents);
