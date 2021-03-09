import { Checkbox, FormControlLabel } from '@material-ui/core';
import { FormikProps } from 'formik';
import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

interface CheckboxInputProps {
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
                        {...this.props}
                        checked={this.props.value}
                    />
                )}
            />
        );
    }
}

export const CheckboxField = asFormField<CheckboxInputProps & FormFieldProps>(CheckboxInput);
