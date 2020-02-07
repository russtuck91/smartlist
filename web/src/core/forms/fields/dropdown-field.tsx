import { FormikProps } from 'formik';
import * as React from 'react';
import Select from 'react-select';

import { asFormField, FormFieldProps } from '../as-form-field';

export interface DropdownInputProps {
    id: string;
    value: any;
    options: any[];
    onChange?: FormikProps<any>['setFieldValue'];
}

export class DropdownInput extends React.Component<DropdownInputProps> {
    render() {
        return (
            <Select
                {...this.props}
            />
        );
    }
}

export const DropdownField = asFormField<DropdownInputProps & FormFieldProps>(DropdownInput);