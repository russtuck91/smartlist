import { AppBar, Button, StyleRules, Theme, Toolbar, Typography, WithStyles, withStyles } from '@material-ui/core';
import { AccountCircle, Home, PlayCircleFilled } from '@material-ui/icons';
import classNames from 'classnames';
import * as React from 'react';
import { isBrowser, isMobile } from 'react-device-detect';
import { connect, ConnectedProps } from 'react-redux';
import { NavLink, Router } from 'react-router-dom';

import { history } from '../core/history/history';
import { FullStore } from '../core/redux/stores';
import { RouteLookup } from '../core/routes/route-lookup';
import isUserLoggedIn from '../core/session/is-user-logged-in';

interface NavigationProps {
}

interface NavigationState {
}

const useStyles = (theme: Theme): StyleRules => ({
    root: {
        '& a': {
            textDecoration: 'none',
            opacity: 0.6,

            '&.active': {
                opacity: 1,
            },
        },
        '& .MuiButton-root': {
            textTransform: 'none',
            fontWeight: 'bold',
        },
    },
    browserRoot: {
        '& a': {
            '&:not(:last-child)': {
                marginRight: theme.spacing(2),
            },
        },
    },
    mobileRoot: {
        '& .MuiToolbar-root': {
            justifyContent: 'space-evenly',
        },

        '& .MuiButton-label': {
            flexDirection: 'column',
            lineHeight: '1.4em',

            '& .MuiButton-startIcon': {
                margin: 0,
            },
            '& .MuiSvgIcon-root': {
                fontSize: '2.2em',
            },
        },
    },
});

const connector = connect((state: FullStore) => {
    return {
        sessionToken: state.session.sessionToken,
    };
});

type FullProps = NavigationProps & WithStyles<typeof useStyles> & ConnectedProps<typeof connector>;

export class RawNavigation extends React.Component<FullProps, NavigationState> {
    state: NavigationState = {
    };

    render() {
        const { classes } = this.props;
        const isLoggedIn = !!isUserLoggedIn();

        return (
            <AppBar
                position="relative"
                className={classNames(classes.root, {
                    [classes.browserRoot]: isBrowser,
                    [classes.mobileRoot]: isMobile,
                })}
            >
                <Router history={history}>
                    <Toolbar>
                        <NavLink to={RouteLookup.home} exact>
                            <Button startIcon={<Home />} >
                                Home
                            </Button>
                        </NavLink>
                        {isLoggedIn ? (
                            <NavLink to={RouteLookup.playlists.base}>
                                <Button startIcon={<PlayCircleFilled />} >
                                    Playlists
                                </Button>
                            </NavLink>
                        ) : null}

                        {isBrowser &&
                            <Typography style={{ flexGrow: 10 }} />}

                        {isLoggedIn ? (
                            <NavLink to={RouteLookup.account}>
                                <Button startIcon={<AccountCircle />} >
                                    Account
                                </Button>
                            </NavLink>
                        ) : (
                            <NavLink to={RouteLookup.login.login}>
                                <Button startIcon={<AccountCircle />}>
                                    Login
                                </Button>
                            </NavLink>
                        )}
                    </Toolbar>
                </Router>
            </AppBar>
        );
    }
}

export const Navigation = connector(withStyles(useStyles)(RawNavigation));
