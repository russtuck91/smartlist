import * as React from 'react';
import { TextField as MUITextField } from '@material-ui/core';

import { FormFieldProps, asFormField } from '../as-form-field';
import { onChangeHandler } from './models';

interface TextInputProps {
    id: string;
    value: any;
    onChange?: onChangeHandler;
}

export class TextInput extends React.Component<TextInputProps> {
    render() {
        return (
            <MUITextField
                {...this.props}
                style={{ width: '100%' }}
            />
        );
    }
}

export const TextField = asFormField<TextInputProps & FormFieldProps>(TextInput);