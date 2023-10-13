import { TextField as MUITextField, Theme, WithStyles, withStyles } from '@material-ui/core';
import { Autocomplete, RenderOptionState } from '@material-ui/lab';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

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
    const defaultInputValue = props.getOptionLabel?.(props.value) || props.value || '';
    const [inputValue, setInputValue] = useState(defaultInputValue);
    const [debouncedInputValue] = useDebounce(inputValue, 500);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setInputValue(defaultInputValue);
    }, [defaultInputValue]);

    const searchUrl = props.getSearchUrl(debouncedInputValue);
    const query = useQuery<any[]>({
        queryKey: ['autocomplete', debouncedInputValue, searchUrl],
        queryFn: async () => {
            if (!debouncedInputValue) {
                return [];
            }
            return await requests.get(searchUrl);
        },
        staleTime: (60 * 60 * 1000),
        refetchOnWindowFocus: false,
        retry: 1,
        onError: () => {
            handleClose();
        },
    });

    function getErrorText() {
        if (query.isLoading) {
            return null;
        }
        if (query.isError) {
            return 'There was a problem fetching results. Please try again.';
        }
        if (typeof props.error === 'boolean') {
            return null;
        }
        return props.error;
    }

    function handleChange(event: React.ChangeEvent<any>|null, value: any) {
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
        // event is null when selecting an option item
        if (!e) { return; }

        setInputValue(newInputValue);
        if (props.freeSolo) handleChange(e, newInputValue);
    }

    return (
        <Autocomplete
            id={props.id}
            value={props.value}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            loading={query.isFetching}
            options={query.data || []}
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
