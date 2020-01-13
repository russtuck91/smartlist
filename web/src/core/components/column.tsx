import * as React from 'react';
import { Col } from 'react-bootstrap';

import './column.scss';

export class Column extends React.Component {
    render() {
        return (
            <Col className="column">{this.props.children}</Col>
        );
    }
}