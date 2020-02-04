import * as React from 'react';
import { Col } from 'react-bootstrap';

import './column.scss';

interface ColumnProps {
    flexProps?: React.CSSProperties;
}

export class Column extends React.Component<ColumnProps> {
    render() {
        const { flexProps } = this.props;

        return (
            <Col className="column" style={flexProps}>{this.props.children}</Col>
        );
    }
}