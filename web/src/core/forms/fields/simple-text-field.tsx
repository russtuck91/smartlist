import * as React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';
import { onChangeHandler } from './models';

import './text-field.scss';

interface TextInputProps {
    id: string;
    value: any;
    onChange?: onChangeHandler;
}

export class SimpleTextInput extends React.Component<TextInputProps> {
    render() {
        return (
            <input
                className="text-input"
                {...this.props}
            />
        );
    }
}

export const SimpleTextField = asFormField<TextInputProps & FormFieldProps>(SimpleTextInput);