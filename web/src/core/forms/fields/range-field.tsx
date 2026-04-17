import { Grid } from '@material-ui/core';
import React from 'react';

import { BetweenValue } from '../../../../../shared';

import { asFormField, FormFieldProps } from '../as-form-field';

import { TextInput } from './text-field';


interface RangeInputProps extends Partial<FormFieldProps> {
    id: string;
    value?: BetweenValue;
    renderStart?: (props: FormFieldProps) => React.ReactNode;
    renderEnd?: (props: FormFieldProps) => React.ReactNode;
    type?: string;
}

export class RangeInput extends React.Component<RangeInputProps> {
    render() {
        return (
            <Grid container wrap="nowrap" alignItems="center" spacing={1}>
                <Grid item xs={6}>
                    {this.renderStart()}
                </Grid>
                <Grid item>to</Grid>
                <Grid item xs={6}>
                    {this.renderEnd()}
                </Grid>
            </Grid>
        );
    }

    private renderStart() {
        const inputProps = {
            ...this.getCommonInputProps(),
            id: `${this.props.id}.start`,
            value: this.props.value?.start,
            type: this.props.type,
        };
        if (this.props.renderStart) {
            return this.props.renderStart(inputProps);
        }
        return (
            <TextInput
                {...inputProps}
                required
            />
        );
    }

    private renderEnd() {
        const inputProps = {
            ...this.getCommonInputProps(),
            id: `${this.props.id}.end`,
            value: this.props.value?.end,
            type: this.props.type,
        };
        if (this.props.renderEnd) {
            return this.props.renderEnd(inputProps);
        }
        return (
            <TextInput
                {...inputProps}
            />
        );
    }

    private getCommonInputProps(): Partial<FormFieldProps> {
        return {
            error: !!this.props.error,
            onChange: this.props.onChange,
            onBlur: this.props.onBlur,
            setFieldValue: this.props.setFieldValue,
            setFieldTouched: this.props.setFieldTouched,
        };
    }
}

export const RangeField = asFormField<RangeInputProps & FormFieldProps>(RangeInput);


export const DefaultRangeField: React.FC<RangeInputProps> = (props) => {
    return (
        <RangeField
            {...props}
            renderFormHelperText
            customValidate={(value: BetweenValue) => {
                if (!value.start && !value.end) {
                    return 'At least 1 value is required';
                }
            }}
        />
    );
};
