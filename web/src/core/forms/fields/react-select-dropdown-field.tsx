import { FormikProps } from 'formik';
import { isEqual } from 'lodash';
import * as React from 'react';
import Select from 'react-select';

import { asFormField, FormFieldProps } from '../as-form-field';


interface ReactSelectDefaultShape {
    label: string;
    value: string;
    transformBack?: boolean;
}
function createDefaultSelectShape(option: string): ReactSelectDefaultShape {
    return { label: option, value: option, transformBack: true };
}


interface DropdownInputProps extends Partial<FormFieldProps> {
    id: string;
    value: any;
    options: any[];
}

export class ReactSelectDropdownInput extends React.Component<DropdownInputProps> {
    render() {
        return (
            <Select
                {...this.props}
                options={this._getOptions()}
                value={this._getValue()}
                onChange={this._onChange}
                // isOptionSelected={this.isOptionSelected}
            />
        );
    }

    private _getOptions() {
        const { options } = this.props;

        if (options.length > 0 && typeof options[0] === 'string') {
            return options.map(createDefaultSelectShape);
        }

        return options;
    }

    private _getValue() {
        const { value } = this.props;

        if (value && typeof value === 'string') {
            return createDefaultSelectShape(value);
        }

        return value;
    }

    private _onChange = (option: any) => {
        const { id, setFieldValue } = this.props;

        if (!setFieldValue) {
            return;
        }

        let valueToSend = option;
        if (option.transformBack) {
            valueToSend = option.value;
        }
        setFieldValue(id, valueToSend);
    }

    private isOptionSelected = (option: any) => {
        // console.log(option);

        return isEqual(option, this._getValue());
    }
}

export const ReactSelectDropdownField = asFormField<DropdownInputProps & FormFieldProps>(ReactSelectDropdownInput);
