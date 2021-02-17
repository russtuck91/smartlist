import { MenuItem, Select } from '@material-ui/core';
import { Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

interface DropdownInputProps extends FormFieldProps {
    id: string;
    value: any;
    options: string[];
}

const useStyles = (theme: Theme) => ({
    select: {
        padding: '8px',
    },
});

type FullProps = DropdownInputProps & WithStyles<typeof useStyles>;

export class RawDropdownInput extends React.Component<FullProps> {
    render() {
        return (
            <Select
                id={this.props.id}
                name={this.props.id}
                value={this.props.value}
                onChange={this.props.onChange}
                classes={this.props.classes}
                disabled={this.props.disabled}
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
