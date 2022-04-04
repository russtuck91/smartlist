import React from 'react';

import { BetweenValue } from '../../../../../shared';

import { FormFieldProps } from '../as-form-field';

import { DefaultRangeField } from './range-field';
import { YearPickerInput } from './year-picker-field';


interface YearRangeFieldProps {
    id: string;
    value: BetweenValue;
}

export class YearRangeField extends React.Component<YearRangeFieldProps> {
    render() {
        return (
            <DefaultRangeField
                id={this.props.id}
                renderStart={this.renderStart}
                renderEnd={this.renderEnd}
            />
        );
    }

    private renderStart = (inputProps: FormFieldProps) => {
        return (
            <YearPickerInput
                {...inputProps}
                maxDate={this.props.value.end}
            />
        );
    };

    private renderEnd = (inputProps: FormFieldProps) => {
        return (
            <YearPickerInput
                {...inputProps}
                minDate={this.props.value.start}
            />
        );
    };
}
