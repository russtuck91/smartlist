import { MenuItem, Select } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';
import { FormikProps } from 'formik';
import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

interface DropdownInputProps {
    id: string;
    value: any;
    options: string[];
    onChange?: FormikProps<any>['handleChange'];
}

const useStyles = (theme: Theme) => ({
    select: {
        padding: '8px'
    }
});

export class RawDropdownInput extends React.Component<DropdownInputProps> {
    render() {
        return (
            <Select
                {...this.props}
                name={this.props.id}
                variant="outlined"
            >
                {this.renderMenuItems()}
            </Select>
        );
    }

    private renderMenuItems() {
        const { options } = this.props;

        return options.map((opt, index) => {
            return (
                <MenuItem
                    key={index}
                    value={opt}
                >
                    {opt}
                </MenuItem>
            );
        });
    }
}

export const DropdownInput = withStyles(useStyles)(RawDropdownInput);

export const DropdownField = asFormField<DropdownInputProps & FormFieldProps>(DropdownInput);