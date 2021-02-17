import * as React from 'react';

import logger from '../logger/logger';

export class ErrorBoundary extends React.Component {
    componentDidCatch(error) {
        console.log('in ErrorBoundary.componentDidCatch');
        console.error(error);
        logger.error(error.message, error.name, error.stack, error);
    }

    render() {
        return this.props.children;
    }
}
