import { FormHelperText } from '@material-ui/core';
import { Field, FormikProps } from 'formik';
import _ from 'lodash';
import * as React from 'react';

export interface FormFieldProps {
    id: string;
    label?: React.ReactNode;
    error?: React.ReactNode;

    required?: boolean;
    customValidate?: (value: any) => string|undefined;
    renderFormHelperText?: boolean;
    disabled?: boolean;

    onChange?: FormikProps<any>['handleChange'];
    onBlur?: FormikProps<any>['handleBlur'];
    setFieldValue?: FormikProps<any>['setFieldValue'];
    setFieldTouched?: FormikProps<any>['setFieldTouched'];
}

export function asFormField<T extends FormFieldProps>(
    WrappedComponent: React.ComponentType<T>,
) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class FieldComponent extends React.Component<T> {
        public static displayName = `asFormField(${displayName})`;

        render() {
            return (
                <div className="form-field">
                    <Field
                        name={this.props.id}
                        render={({ field, form }) => {
                            const fieldTouched = _.get(form.touched, field.name);
                            const fieldError = _.get(form.errors, field.name);
                            return (
                                <>
                                    <WrappedComponent
                                        {...field}
                                        setFieldValue={form.setFieldValue}
                                        setFieldTouched={form.setFieldTouched}
                                        error={fieldTouched && fieldError}
                                        {...this.props}
                                    />
                                    {this.props.renderFormHelperText && fieldTouched && fieldError && (
                                        <FormHelperText error>{fieldError}</FormHelperText>
                                    )}
                                </>
                            );
                        }}
                        validate={this.validate}
                    />
                    {this.renderError()}
                </div>
            );
        }

        private renderError() {
            const { error } = this.props;

            if (!error) {
                return null;
            }

            return error;
        }

        private validate = (value: any) => {
            const { required, customValidate } = this.props;

            if (required && (value === undefined || value === null || value === '')) {
                return 'Field is required';
            }

            if (customValidate) {
                return customValidate(value);
            }
        };
    };
}
