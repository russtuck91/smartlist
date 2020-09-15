import { Avatar, ListItem, ListItemAvatar, ListItemText, TextField as MUITextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { debounce } from 'lodash';
import * as React from 'react';

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

export class AutocompleteInput extends React.Component<AutocompleteInputProps, AutocompleteInputState> {
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
                        <Avatar src={option.images[0].url} />
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

export const AutocompleteField = asFormField<AutocompleteInputProps & FormFieldProps>(AutocompleteInput);