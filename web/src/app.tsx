import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import './app.scss';
import './app-old.css';
import { Navigation } from "./navigation/navigation";
import { Home } from "./home";

export class App extends Component {
    render() {
        return (
            <div className="app">
                <BrowserRouter>
                    <>
                        <Navigation />
                        <Switch>
                            <Route exact path="/" component={Home} />
                        </Switch>
                    </>
                </BrowserRouter>
            </div>
        );
    }
}
