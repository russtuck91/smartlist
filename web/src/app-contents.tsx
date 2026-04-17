
import { StyleRules, WithStyles, withStyles } from '@material-ui/core';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { connect, ConnectedProps } from 'react-redux';
import { Route, Switch } from 'react-router';

import { ErrorBoundary } from './core/errors/error-boundary';
import { FullStore } from './core/redux/stores';
import { RouteLookup } from './core/routes/route-lookup';

import { Account } from './account/account';
import { Home } from './home/home';
import { IndexRouter } from './index-router';
import { Login } from './login/login';
import { LoginCallback } from './login/login-callback';
import { Logout } from './login/logout';
import { Navigation } from './navigation/navigation';
import { PlaylistContainer } from './playlists/playlist-container';
import PrivacyPolicy from './privacy-policy/privacy-policy';
import ShakeFeedback from './shake-feedback/shake-feedback';

interface AppContentsProps {}

const useStyles = (): StyleRules => ({
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
    },
});

const connector = connect((state: FullStore) => ({
    sessionToken: state.session.sessionToken,
}));

type FullProps = AppContentsProps & WithStyles<typeof useStyles> & ConnectedProps<typeof connector>;

export class RawAppContents extends React.Component<FullProps> {
    render() {
        return (
            <div className={this.props.classes.root}>
                <Navigation />
                <ShakeFeedback />
                <div className={this.props.classes.mainContents}>
                    <ErrorBoundary>
                        <Switch>
                            {this.props.sessionToken && (
                                <Route path={RouteLookup.playlists.base} component={PlaylistContainer} />
                            )}

                            <Route exact path={RouteLookup.login.callback} component={LoginCallback} />
                            <Route path={RouteLookup.login.login} component={Login} />
                            <Route exact path={RouteLookup.logout} component={Logout} />

                            {this.props.sessionToken && (
                                <Route exact path={RouteLookup.account} component={Account} />
                            )}
                            <Route exact path={RouteLookup.privacyPolicy} component={PrivacyPolicy} />
                            <Route exact path={RouteLookup.home} component={Home} />
                            <Route path={RouteLookup.index} component={IndexRouter} />
                        </Switch>
                    </ErrorBoundary>
                </div>
            </div>
        );
    }
}

export const AppContents = connector(withStyles(useStyles)(RawAppContents));
