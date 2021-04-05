import { KeyboardDatePicker } from '@material-ui/pickers';
import moment, { Moment } from 'moment';
import React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';

interface YearPickerInputProps extends Partial<FormFieldProps> {
    id: string;
    value?: string;
}

export class YearPickerInput extends React.Component<YearPickerInputProps> {
    render() {
        return (
            <KeyboardDatePicker
                value={moment(this.props.value).isValid() ? moment.utc(this.props.value) : null}
                inputValue={this.props.value}
                onChange={this.onChange}
                variant="inline"
                views={['year']}
                disableFuture
            />
        );
    }

    private onChange = (date: Moment, value: string|null|undefined) => {
        if (!this.props.setFieldValue) {
            return;
        }

        this.props.setFieldValue(this.props.id, value);
    }
}

export const YearPickerField = asFormField<YearPickerInputProps & FormFieldProps>(YearPickerInput);
