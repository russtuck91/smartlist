import { FormControl, FormLabel, StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React from 'react';

import { asFormField, FormFieldProps } from '../as-form-field';


interface ToggleButtonInputProps extends FormFieldProps {
    value?: string;
    options: string[];
}

const useStyles = (theme: Theme): StyleRules => ({
    formControl: {
        width: '100%',
    },
    formLabel: {
        marginBottom: theme.spacing(0.75),
    },
    toggleButtonOption: {
        flex: '1 1 auto',
        textTransform: 'none',
    },
});

type FullProps = ToggleButtonInputProps & WithStyles<typeof useStyles>;

export class RawToggleButtonInput extends React.Component<FullProps> {
    render() {
        return (
            <FormControl
                component="fieldset"
                className={this.props.classes.formControl}
            >
                <FormLabel
                    component="legend"
                    className={this.props.classes.formLabel}
                >
                    {this.props.label}
                </FormLabel>
                <ToggleButtonGroup
                    id={this.props.id}
                    value={this.props.value}
                    onChange={this.onChange}
                    exclusive
                    size="small"
                >
                    {this.props.options.map((option, index) => (
                        <ToggleButton
                            key={index}
                            value={option}
                            className={this.props.classes.toggleButtonOption}
                        >
                            {option}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </FormControl>
        );
    }

    private onChange = (event: React.MouseEvent, value: string|null) => {
        if (value) {
            this.props.setFieldValue?.(this.props.id, value);
        }
    };
}

export const ToggleButtonInput = withStyles(useStyles)(RawToggleButtonInput);

export const ToggleButtonField = asFormField<ToggleButtonInputProps>(ToggleButtonInput);
