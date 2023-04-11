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
    fetchError?: Error;
    open: boolean;
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
        open: false,
    };

    render() {
        return (
            <Autocomplete
                id={this.props.id}
                value={this.props.value}
                inputValue={this.state.textFieldValue}
                onInputChange={this.handleInputChange}
                loading={this.state.loading}
                options={this.state.options}
                getOptionLabel={this.props.getOptionLabel}
                renderOption={this.props.renderOption}
                onChange={this.onChange}
                onBlur={this.props.onBlur}
                open={this.state.open}
                onOpen={this.handleOpen}
                onClose={this.handleClose}
                classes={this.props.classes}
                filterOptions={(options) => options}

                freeSolo={this.props.freeSolo}
                renderInput={(params) => (
                    <MUITextField
                        {...params}
                        error={!!this.getErrorText()}
                        helperText={this.getErrorText()}
                    />
                )}
            />
        );
    }

    private getErrorText() {
        if (this.state.loading) {
            return null;
        }
        if (this.state.fetchError) {
            return 'There was a problem fetching results. Please try again.';
        }
        if (typeof this.props.error === 'boolean') {
            return null;
        }
        return this.props.error;
    }

    private onChange = (event: React.ChangeEvent<any>, value: any) => {
        if (!this.props.setFieldValue) {
            return;
        }

        this.props.setFieldValue(this.props.id, value);
    };

    private handleOpen = () => {
        this.setState({
            open: true,
        });
    };

    private handleClose = () => {
        this.setState({
            open: false,
        });
    };

    private handleInputChange = (e: React.ChangeEvent<unknown>|null, newInputValue: string) => {
        if (e?.type === 'blur' && !newInputValue) { return; }
        this.setState({
            textFieldValue: newInputValue,
            fetchError: undefined,
        });
        this.searchByText(newInputValue);
    };

    private searchByText = debounce(async (text: string) => {
        this.setState({
            loading: true,
        });
        try {
            const searchUrl = this.props.getSearchUrl(text);
            const result = await requests.get(searchUrl);
            this.setState({
                loading: false,
                options: result,
            });
        } catch (e) {
            console.error(e);
            this.setState({
                loading: false,
                fetchError: e,
            });
            this.handleClose();
        }
    }, 500);
}

export const AutocompleteInput = withStyles(useStyles)(RawAutocompleteInput);

export const AutocompleteField = asFormField<AutocompleteInputProps & FormFieldProps>(AutocompleteInput);
