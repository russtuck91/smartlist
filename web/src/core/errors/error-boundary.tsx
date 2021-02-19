import * as React from 'react';

import logger from '../logger/logger';

interface ErrorBoundaryProps {
    children?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
    componentDidCatch(error) {
        console.log('in ErrorBoundary.componentDidCatch');
        console.error(error);
        logger.error(error.message, error.name, error.stack, error);
    }

    render() {
        return this.props.children;
    }
}
