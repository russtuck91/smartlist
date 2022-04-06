import { TextField as MUITextField, Theme, WithStyles, withStyles } from '@material-ui/core';
import { Autocomplete, RenderOptionState } from '@material-ui/lab';
import { debounce } from 'lodash';
import * as React from 'react';

import { requests } from '../../requests/requests';

import { asFormField, FormFieldProps } from '../as-form-field';


interface AutocompleteInputProps extends Partial<FormFieldProps> {
    id: string;
    value: any;
    getSearchUrl: (text: string) => string;
    renderOption?: (option: any, state: RenderOptionState) => React.ReactNode;
    getOptionLabel?: (option?: any) => string;
    freeSolo?: boolean;
}

interface AutocompleteInputState {
    textFieldValue: string;
    loading: boolean;
    options: any[];
}

const useStyles = (theme: Theme) => ({
    option: {
        padding: theme.spacing(1),
        '& > .MuiListItem-gutters': {
            padding: 0,
        },
        '& .MuiListItemAvatar-root': {
            minWidth: 'auto',
            marginRight: theme.spacing(1),
            '& img': {
                maxWidth: '100%',
            },
        },
        '& .MuiListItemText-primary': {
            display: 'block',
            fontSize: 12,
            lineHeight: 1,
        },
    },
});

type FullProps = AutocompleteInputProps & WithStyles<typeof useStyles>;

export class RawAutocompleteInput extends React.Component<FullProps, AutocompleteInputState> {
    state: AutocompleteInputState = {
        textFieldValue: '',
        loading: false,
        options: [],
    };

    render() {
        return (
            <Autocomplete
                id={this.props.id}
                value={this.props.value}
                loading={this.state.loading}
                options={this.state.options}
                getOptionLabel={this.props.getOptionLabel}
                renderOption={this.props.renderOption}
                onChange={this.onChange}
                onBlur={this.props.onBlur}
                classes={this.props.classes}

                freeSolo={this.props.freeSolo}
                renderInput={(params) => (
                    <MUITextField
                        {...params}
                        value={this.state.textFieldValue}
                        onChange={this.onTextFieldChange}
                        error={!!this.props.error}
                        helperText={typeof this.props.error === 'boolean' ? null : this.props.error}
                    />
                )}
            />
        );
    }

    private onChange = (event: React.ChangeEvent<any>, value: any) => {
        if (!this.props.setFieldValue) {
            return;
        }

        this.props.setFieldValue(this.props.id, value);
    };

    private onTextFieldChange = (e: React.ChangeEvent<any>) => {
        const value = e.target.value;
        this.setState({ textFieldValue: value });
        this.searchByText(value);
    };

    private searchByText = debounce(async (text: string) => {
        this.setState({
            loading: true,
        });
        const searchUrl = this.props.getSearchUrl(text);
        const result = await requests.get(searchUrl);
        this.setState({
            loading: false,
            options: result,
        });
    }, 500);
}

export const AutocompleteInput = withStyles(useStyles)(RawAutocompleteInput);

export const AutocompleteField = asFormField<AutocompleteInputProps & FormFieldProps>(AutocompleteInput);
