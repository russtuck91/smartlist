import './app.scss';
import './core/analytics/google-analytics';

import MomentUtils from '@date-io/moment';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { teal } from '@material-ui/core/colors';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Component } from 'react';
import { Router } from 'react-router';

import { ErrorBoundary } from './core/errors/error-boundary';
import { history } from './core/history/history';

import { AppContents } from './app-contents';

export class App extends Component {
    render() {
        const theme = createMuiTheme({
            palette: {
                type: 'dark',
                primary: teal,
            },
            overrides: {
                MuiInputBase: {
                    root: {
                        width: '100%',
                    },
                },
                MuiTableCell: {
                    head: {
                        fontWeight: 'bold',
                    },
                },
            },
        });
        theme.overrides!.MuiTableCell!.head = {
            ...theme.overrides!.MuiTableCell!.head,
            backgroundColor: theme.palette.background.default,
        };

        return (
            <div className="app">
                <ErrorBoundary>
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <Router history={history}>
                                <AppContents />
                            </Router>
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                </ErrorBoundary>
            </div>
        );
    }
}
