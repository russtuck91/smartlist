import { Checkbox, FormControlLabel, WithStyles, withStyles } from '@material-ui/core';
import { FormikProps } from 'formik';
import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

interface CheckboxInputProps extends Partial<FormFieldProps> {
    id: string;
    value?: boolean;
    onChange?: FormikProps<any>['handleChange'];
    label?: string;
}

const useStyles = () => ({
    root: {
        marginRight: 0,
    },
});

type FullProps = CheckboxInputProps & WithStyles<typeof useStyles>;

export class RawCheckboxInput extends React.Component<FullProps> {
    render() {
        return (
            <FormControlLabel
                classes={this.props.classes}
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

const CheckboxInput = withStyles(useStyles)(RawCheckboxInput);

export const CheckboxField = asFormField<CheckboxInputProps & FormFieldProps>(CheckboxInput);
