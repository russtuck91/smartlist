import { TextField as MUITextField } from '@material-ui/core';
import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

interface TextInputProps extends Partial<FormFieldProps> {
    id: string;
    value?: any;

    variant?: 'standard'|'filled'|'outlined';
    multiline?: boolean;
    rows?: number;
}

export class TextInput extends React.Component<TextInputProps> {
    render() {
        return (
            <MUITextField
                id={this.props.id}
                value={this.props.value}
                onChange={this.props.onChange}
                label={this.props.label}
                required={this.props.required}

                variant={this.props.variant as any}
                multiline={this.props.multiline}
                rows={this.props.rows}

                style={{ width: '100%' }}
            />
        );
    }
}

export const TextField = asFormField<TextInputProps & FormFieldProps>(TextInput);
