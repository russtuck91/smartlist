import { Field } from 'formik';
import * as React from 'react';
import { ControlLabel } from 'react-bootstrap';

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
                    {this.renderLabel()}
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

        private renderLabel() {
            const { label } = this.props;

            if (!label) {
                return null;
            }

            return <ControlLabel>{label}</ControlLabel>
        }

        private renderError() {
            const { error } = this.props;

            if (!error) {
                return null;
            }

            return error;
        }
    }
}