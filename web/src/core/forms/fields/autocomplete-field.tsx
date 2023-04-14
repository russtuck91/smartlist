import { TextField as MUITextField, Theme, WithStyles, withStyles } from '@material-ui/core';
import { Autocomplete, RenderOptionState } from '@material-ui/lab';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';

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

const useStyles = (theme: Theme) => ({
    option: {
        padding: theme.spacing(0.5),
        '& > .MuiListItem-container': {
            width: '100%',
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
            lineHeight: 1.2,
        },
        '& .MuiListItemText-secondary': {
            fontSize: 10,
            lineHeight: 1.2,
        },
    },
});

type FullProps = AutocompleteInputProps & WithStyles<typeof useStyles>;

function RawAutocompleteInput(props: FullProps) {
    const [textFieldValue, setTextFieldValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);
    const [fetchError, setFetchError] = useState<Error|null>(null);
    const [open, setOpen] = useState(false);

    function getErrorText() {
        if (loading) {
            return null;
        }
        if (fetchError) {
            return 'There was a problem fetching results. Please try again.';
        }
        if (typeof props.error === 'boolean') {
            return null;
        }
        return props.error;
    }

    function handleChange(event: React.ChangeEvent<any>, value: any) {
        if (!props.setFieldValue) {
            return;
        }

        props.setFieldValue(props.id, value);
    }

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    function handleInputChange(e: React.ChangeEvent<unknown>|null, newInputValue: string) {
        if (e?.type === 'blur' && !newInputValue) { return; }
        setTextFieldValue(newInputValue);
        setFetchError(null);
        searchByText(newInputValue);
    }

    const searchByText = useCallback(debounce(
        async (text: string) => {
            if (!text) {
                return;
            }
            setLoading(true);
            try {
                const searchUrl = props.getSearchUrl(text);
                const result = await requests.get(searchUrl);
                setLoading(false);
                setFetchError(null);
                setOptions(result);
            } catch (e) {
                console.error(e);
                setLoading(false);
                setFetchError(e);
                handleClose();
            }
        },
        500,
    ), []);

    return (
        <Autocomplete
            id={props.id}
            value={props.value}
            inputValue={textFieldValue}
            onInputChange={handleInputChange}
            loading={loading}
            options={options}
            getOptionLabel={props.getOptionLabel}
            renderOption={props.renderOption}
            onChange={handleChange}
            onBlur={props.onBlur}
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            classes={props.classes}
            filterOptions={(optionsForFilter) => optionsForFilter}

            freeSolo={props.freeSolo}
            renderInput={(params) => (
                <MUITextField
                    {...params}
                    error={!!getErrorText()}
                    helperText={getErrorText()}
                />
            )}
        />
    );
}

export const AutocompleteInput = withStyles(useStyles)(RawAutocompleteInput);

export const AutocompleteField = asFormField<AutocompleteInputProps & FormFieldProps>(AutocompleteInput);
