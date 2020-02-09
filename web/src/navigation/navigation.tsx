import { AppBar, Link, Toolbar, Typography, withStyles, Theme, WithStyles } from '@material-ui/core';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { RouteLookup } from '../core/routes/route-lookup';
import { session } from '../core/session/session';

import './navigation.scss';

interface NavigationProps {
}

const useStyles = (theme: Theme) => ({
    root: {
        '& .MuiLink-root': {
            '&:hover': {
                color: 'inherit'
            },
            '&:not(:last-child)': {
                marginRight: theme.spacing(2)
            }
        }
    }
});

type FullProps = NavigationProps & WithStyles<typeof useStyles>;

export class RawNavigation extends React.Component<FullProps> {
    render() {
        const { classes } = this.props;
        const isLoggedIn = !!session.getAccessToken();

        return (
            <AppBar position="sticky" className={classes.root}>
                <Toolbar>
                    <Link to={RouteLookup.home} component={RouterLink} color="inherit">Home</Link>
                    {isLoggedIn ? (
                        <Link to={RouteLookup.playlists.base} component={RouterLink} color="inherit">Playlists</Link>
                    ) : null}

                    <Typography style={{ flexGrow: 10 }} />

                    {isLoggedIn ? (
                        <Link to={RouteLookup.account} component={RouterLink} color="inherit">My Account</Link>
                    ) : (
                        <Link to={RouteLookup.login.login} component={RouterLink} color="inherit">Login</Link>
                    )}
                </Toolbar>
            </AppBar>
        );
    }
}

export const Navigation = withStyles(useStyles)(RawNavigation);