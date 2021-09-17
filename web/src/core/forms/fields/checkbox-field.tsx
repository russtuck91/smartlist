import { Checkbox, FormControlLabel } from '@material-ui/core';
import { FormikProps } from 'formik';
import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

interface CheckboxInputProps extends Partial<FormFieldProps> {
    id: string;
    value?: boolean;
    onChange?: FormikProps<any>['handleChange'];
    label?: string;
}

export class CheckboxInput extends React.Component<CheckboxInputProps> {
    render() {
        return (
            <FormControlLabel
                label={this.props.label}
                control={(
                    <Checkbox
                        id={this.props.id}
                        checked={this.props.value}
                        onChange={this.props.onChange}
                        disabled={this.props.disabled}
                    />
                )}
            />
        );
    }
}

export const CheckboxField = asFormField<CheckboxInputProps & FormFieldProps>(CheckboxInput);
