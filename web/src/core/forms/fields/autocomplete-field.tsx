import { Avatar, ListItem, ListItemAvatar, ListItemText, TextField as MUITextField, Theme, WithStyles, withStyles } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { debounce } from 'lodash';
import * as React from 'react';
import LazyLoad from 'react-lazyload';

import { RuleParam, SearchItem } from '../../../../../shared';

import { baseRequestUrl, requests } from '../../requests/requests';
import { asFormField, FormFieldProps } from '../as-form-field';


interface AutocompleteInputProps extends Partial<FormFieldProps> {
    id: string;
    value: any;
    type: RuleParam;
}

interface AutocompleteInputState {
    textFieldValue: string;
    loading: boolean;
    options: SearchItem[];
}

const useStyles = (theme: Theme) => ({
    option: {
        padding: 0,
        '& > .MuiListItem-gutters': {
            padding: theme.spacing(1)
        },
        '& .MuiListItemAvatar-root': {
            minWidth: 'auto',
            marginRight: theme.spacing(1),
            '& img': {
                maxWidth: '100%'
            },
        },
        '& .MuiListItemText-primary': {
            display: 'block',
            fontSize: 12,
            lineHeight: 1
        }
    }
});

type FullProps = AutocompleteInputProps & WithStyles<typeof useStyles>;

export class RawAutocompleteInput extends React.Component<FullProps, AutocompleteInputState> {
    state: AutocompleteInputState = {
        textFieldValue: '',
        loading: false,
        options: []
    };

    render() {
        return (
            <Autocomplete
                {...this.props}
                loading={this.state.loading}
                options={this.state.options}
                getOptionLabel={(option: SearchItem) => option.name}
                renderOption={this.renderOption}
                onChange={this.onChange}
                renderInput={(params) => (
                    <MUITextField
                        {...params}
                        value={this.state.textFieldValue}
                        onChange={this.onTextFieldChange}
                    />
                )}
            />
        );
    }

    private renderOption = (option: SearchItem, state: object) => {
        return (
            <ListItem>
                {option.images && option.images[0] ? (
                    <ListItemAvatar>
                        <Avatar>
                            <LazyLoad overflow>
                                <img src={option.images[0].url} />
                            </LazyLoad>
                        </Avatar>
                    </ListItemAvatar>
                ) : null}
                <ListItemText primary={option.name} />
            </ListItem>
        );
    }

    private onChange = (event: React.ChangeEvent<any>, value: any) => {
        if (!this.props.setFieldValue) {
            return;
        }

        this.props.setFieldValue(this.props.id, value);
    }

    private onTextFieldChange = (e: React.ChangeEvent<any>) => {
        const value = e.target.value;
        this.setState({ textFieldValue: value });
        this.searchByText(value);
    }

    private searchByText = debounce(async (text: string) => {
        this.setState({
            loading: true
        });
        const result = await requests.get(`${baseRequestUrl}/search?type=${this.props.type}&text=${encodeURIComponent(text)}`);
        this.setState({
            loading: false,
            options: result
        });
    }, 500);
}

export const AutocompleteInput = withStyles(useStyles)(RawAutocompleteInput);

export const AutocompleteField = asFormField<AutocompleteInputProps & FormFieldProps>(AutocompleteInput);