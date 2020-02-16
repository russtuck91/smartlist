import { Field } from 'formik';
import * as React from 'react';

export interface FormFieldProps {
    id: string;
    label?: React.ReactNode;
    error?: React.ReactNode;

    required?: boolean;
}

export function asFormField<T extends FormFieldProps>(
    WrappedComponent: React.ComponentType<T>
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
                            return (
                                <WrappedComponent
                                    {...field}
                                    {...this.props}
                                />
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
            const { required } = this.props;

            if (required && (value === undefined || value === null || value === '')) {
                return 'Field is required';
            }
        }
    };
}