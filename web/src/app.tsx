import 'setimmediate';
import './app.scss';
import './core/analytics/google-analytics';

import MomentUtils from '@date-io/moment';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { teal } from '@material-ui/core/colors';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

import { ErrorBoundary } from './core/errors/error-boundary';
import { history } from './core/history/history';
import { store } from './core/redux/stores';

import { AppContents } from './app-contents';

const customColors = {
    andGroupRed: '#451717',
    orGroupBlue: '#172545',
};
declare module '@material-ui/core/styles/createMuiTheme' {
    interface Theme {
        colors: typeof customColors;
    }
}
declare module '@material-ui/core/styles/createPalette' {
    interface TypeBackground {
        secondary: string;
    }
}

export class App extends Component {
    render() {
        const theme = createMuiTheme({
            palette: {
                type: 'dark',
                primary: teal,
                background: {
                    secondary: '#191919',
                },
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
        theme.colors = customColors;
        theme.overrides!.MuiTableCell!.head = {
            ...theme.overrides!.MuiTableCell!.head,
            backgroundColor: theme.palette.background.default,
        };
        theme.overrides!.MuiTableCell!.sizeSmall = {
            ...theme.overrides!.MuiTableCell!.sizeSmall,
            padding: `${theme.spacing(0.75)}px ${theme.spacing(1.5)}px`,
        };

        return (
            <div className="app">
                <ErrorBoundary>
                    <Provider store={store}>
                        <ThemeProvider theme={theme}>
                            <MuiPickersUtilsProvider utils={MomentUtils}>
                                <Router history={history}>
                                    <AppContents />
                                </Router>
                            </MuiPickersUtilsProvider>
                        </ThemeProvider>
                    </Provider>
                </ErrorBoundary>
            </div>
        );
    }
}
