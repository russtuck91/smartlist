import { Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';

import logger from '../logger/logger';


interface ErrorBoundaryProps {
    children?: React.ReactNode;
}

interface ErrorBoundaryState {
    error?: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {};

    static getDerivedStateFromError(error) {
        return { error: error };
    }

    componentDidCatch(error) {
        console.log('in ErrorBoundary.componentDidCatch');
        console.error(error);
        logger.error(error.message, error.name, error.stack, error);
    }

    render() {
        if (this.state.error) {
            return (
                <Box>
                    <Alert severity="error">Something went wrong. Please try again.</Alert>
                </Box>
            );
        }
        return this.props.children;
    }
}
