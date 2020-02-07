import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';
import { onChangeHandler } from './models';

export interface TextInputProps {
    id: string;
    value: any;
    onChange?: onChangeHandler;
}

export class TextInput extends React.Component<TextInputProps> {
    render() {
        return (
            <input
                {...this.props}
            />
        );
    }
}

export const TextField = asFormField<TextInputProps & FormFieldProps>(TextInput);