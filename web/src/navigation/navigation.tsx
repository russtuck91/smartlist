import * as React from 'react';
import { Navbar, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { session } from '../core/session/session';

import './navigation.scss';
import { RouteLookup } from '../core/routes/route-lookup';

export class Navigation extends React.Component {
    render() {
        const isLoggedIn = !!session.getAccessToken();

        return (
            <div id="navigation">
                <Navbar>
                    <LinkContainer to={RouteLookup.home}><NavItem>Home</NavItem></LinkContainer>
                    {isLoggedIn ? (
                        <LinkContainer to={RouteLookup.playlists.base}><NavItem>Playlists</NavItem></LinkContainer>
                    ) : null}
                    {isLoggedIn ? (
                        <LinkContainer to={RouteLookup.account}><NavItem>My Account</NavItem></LinkContainer>
                    ) : (
                        <LinkContainer to={RouteLookup.login}><NavItem>Login</NavItem></LinkContainer>
                    )}
                </Navbar>
            </div>
        );
    }
}