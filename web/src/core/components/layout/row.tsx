import * as React from 'react';
import { Row as BSRow } from 'react-bootstrap';

import './row.scss';

interface RowProps {
    flexProps?: React.CSSProperties;
}

export class Row extends React.Component<RowProps> {
    render() {
        const { flexProps } = this.props;

        return <BSRow style={flexProps}>{this.props.children}</BSRow>;
    }
}