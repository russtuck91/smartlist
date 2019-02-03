import * as React from 'react';
import { Navbar, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export class Navigation extends React.Component {
    render() {
        return (
            <div id="navigation">
                <Navbar>
                    <LinkContainer to="/"><NavItem>Home</NavItem></LinkContainer>
                    <LinkContainer to="/account/"><NavItem>My Account</NavItem></LinkContainer>
                </Navbar>
            </div>
        );
    }
}