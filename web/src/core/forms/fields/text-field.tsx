import * as React from 'react';
import { Field } from 'formik';

export interface TextInputProps {
    id: string;
    value: any;
}

export class TextInput extends React.Component<TextInputProps> {
    render() {
        const { id, value } = this.props;

        return (
            <Field
                render={({ field }) => (
                    <input
                        {...field}
                        id={id}
                        value={value}
                    />
                )}
            />
        );
    }
}