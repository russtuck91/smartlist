import * as React from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';


interface LoginErrorState {
    open: boolean;
}

export class LoginError extends React.Component<any, LoginErrorState> {
    state = {
        open: true
    };

    render() {
        return (
            <Snackbar
                open={this.state.open}
                autoHideDuration={6000}
                onClose={this.handleClose}
            >
                <Alert severity="error">
                    There was a problem processing your login request. Please try again.
                </Alert>
            </Snackbar>
        );
    }

    private handleClose = () => {
        this.setState({
            open: false
        });
    }
}