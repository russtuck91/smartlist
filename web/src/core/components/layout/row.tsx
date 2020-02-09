import * as React from 'react';
import { Row as BSRow } from 'react-bootstrap';

import { BasicComponentProps } from '../basic-component-props';

import './row.scss';

interface RowProps extends BasicComponentProps {
    flexProps?: React.CSSProperties;
}

export class Row extends React.Component<RowProps> {
    render() {
        const { id, className, flexProps } = this.props;

        return (
            <BSRow id={id} className={className} style={flexProps}>
                {this.props.children}
            </BSRow>
        );
    }
}