import { KeyboardDatePicker } from '@material-ui/pickers';
import moment, { Moment } from 'moment';
import React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';


const YEAR_FORMAT = 'YYYY';

interface YearPickerInputProps extends Partial<FormFieldProps> {
    id: string;
    value?: string;
    minDate?: string;
    maxDate?: string;
}

export class YearPickerInput extends React.Component<YearPickerInputProps> {
    render() {
        return (
            <KeyboardDatePicker
                value={moment(this.props.value, YEAR_FORMAT).isValid() ? moment.utc(this.props.value, YEAR_FORMAT) : null}
                inputValue={this.props.value}
                onChange={this.onChange}
                onBlur={this.onBlur}
                {...(this.props.error ? {
                    error: true,
                    helperText: typeof this.props.error === 'boolean' ? null : this.props.error,
                } : {})}
                variant="inline"
                views={['year']}
                disableFuture
                minDate={this.props.minDate ? moment.utc(this.props.minDate, YEAR_FORMAT) : undefined}
                maxDate={this.props.maxDate ? moment.utc(this.props.maxDate, YEAR_FORMAT) : undefined}
                style={{ width: '100%' }}
            />
        );
    }

    private onChange = (date: Moment, value: string|null|undefined) => {
        if (!this.props.setFieldValue) {
            return;
        }

        this.props.setFieldValue(this.props.id, value);
    };

    private onBlur = () => {
        this.props.setFieldTouched?.(this.props.id);
    };
}

export const YearPickerField = asFormField<YearPickerInputProps & FormFieldProps>(YearPickerInput);
