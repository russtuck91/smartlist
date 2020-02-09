import { Field } from 'formik';
import * as React from 'react';

export interface FormFieldProps {
    label?: React.ReactNode;
    error?: React.ReactNode;
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
                        render={({ field, form }) => {
                            return (
                                <WrappedComponent
                                    {...field}
                                    {...this.props}
                                />
                            );
                        }}
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
    };
}