import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './app.scss';
import './app-old.css';
import { Navigation } from "./navigation/navigation";
import { Home } from "./home";
import { Account } from './account/account';
import { Login } from './login/login';

export class App extends Component {
    render() {
        return (
            <div className="app">
                <BrowserRouter>
                    <>
                        <Navigation />
                        <Switch>
                            <Route exact path="/login/" component={Login} />
                            <Route exact path="/account/" component={Account} />
                            <Route exact path="/" component={Home} />
                        </Switch>
                    </>
                </BrowserRouter>
            </div>
        );
    }
}
