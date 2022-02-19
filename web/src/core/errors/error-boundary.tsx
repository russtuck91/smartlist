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
            return <h2>Something went wrong. Please try again.</h2>;
        }
        return this.props.children;
    }
}
