import { AppBar, Link, Toolbar, Typography, withStyles, Theme, WithStyles, Menu, IconButton, MenuItem } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import * as React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import { FullStore } from '../core/redux/stores';
import { RouteLookup } from '../core/routes/route-lookup';
import isUserLoggedIn from '../core/session/is-user-logged-in';

interface NavigationProps {
}

interface NavigationState {
    menuAnchor?: HTMLElement;
}

const useStyles = (theme: Theme) => ({
    root: {
        '& .MuiLink-root': {
            '&:hover': {
                color: 'inherit',
            },
            '&:not(:last-child)': {
                marginRight: theme.spacing(2),
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
        const { menuAnchor } = this.state;
        const isLoggedIn = !!isUserLoggedIn();

        return (
            <AppBar position="sticky" className={classes.root}>
                <Toolbar>
                    <Link to={RouteLookup.home} component={RouterLink} color="inherit">Home</Link>
                    {isLoggedIn ? (
                        <Link to={RouteLookup.playlists.base} component={RouterLink} color="inherit">Playlists</Link>
                    ) : null}

                    <Typography style={{ flexGrow: 10 }} />

                    {isLoggedIn ? (
                        <div>
                            <IconButton
                                onClick={this.handleMenuButtonClick}
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                anchorEl={menuAnchor}
                                open={!!menuAnchor}
                                onClose={this.handleMenuClose}
                            >
                                <Link to={RouteLookup.account} component={RouterLink} color="inherit" underline="none">
                                    <MenuItem onClick={this.handleMenuClose}>My Account</MenuItem>
                                </Link>
                                <Link to={RouteLookup.logout} component={RouterLink} color="inherit" underline="none">
                                    <MenuItem onClick={this.handleMenuClose}>Logout</MenuItem>
                                </Link>
                            </Menu>
                        </div>
                    ) : (
                        <Link to={RouteLookup.login.login} component={RouterLink} color="inherit">Login</Link>
                    )}
                </Toolbar>
            </AppBar>
        );
    }

    private handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.setState({
            menuAnchor: event.currentTarget,
        });
    }

    private handleMenuClose = () => {
        this.setState({
            menuAnchor: undefined,
        });
    }
}

export const Navigation = connector(withStyles(useStyles)(RawNavigation));
