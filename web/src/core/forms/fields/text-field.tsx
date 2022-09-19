import { InputAdornment, TextField as MUITextField } from '@material-ui/core';
import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

interface TextInputProps extends Partial<FormFieldProps> {
    id: string;
    value?: any;

    variant?: 'standard'|'filled'|'outlined';
    multiline?: boolean;
    rows?: number;
    startAdornment?: React.ReactNode;
}

export class TextInput extends React.Component<TextInputProps> {
    render() {
        return (
            <MUITextField
                id={this.props.id}
                value={this.props.value}
                onChange={this.props.onChange}
                onBlur={this.props.onBlur}
                label={this.props.label}
                required={this.props.required}
                error={!!this.props.error}
                helperText={typeof this.props.error === 'boolean' ? null : this.props.error}

                variant={this.props.variant}
                multiline={this.props.multiline}
                rows={this.props.rows}
                InputProps={{
                    startAdornment: this.props.startAdornment ? (
                        <InputAdornment position="start">
                            {this.props.startAdornment}
                        </InputAdornment>
                    ) : null,
                }}

                style={{ width: '100%' }}
            />
        );
    }
}

export const TextField = asFormField<TextInputProps & FormFieldProps>(TextInput);
