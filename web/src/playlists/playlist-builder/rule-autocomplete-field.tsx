import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import { RenderOptionState } from '@material-ui/lab';
import React from 'react';
import LazyLoad from 'react-lazyload';

import { PlaylistRule, SearchItem } from '../../../../shared';

import { AutocompleteField } from '../../core/forms/fields/autocomplete-field';
import { baseRequestUrl } from '../../core/requests/requests';


interface RuleAutocompleteFieldProps {
    id: string;
    rule: PlaylistRule;
}

export class RuleAutocompleteField extends React.Component<RuleAutocompleteFieldProps> {
    render() {
        return (
            <AutocompleteField
                id={this.props.id}
                value={this.props.rule.value}
                getSearchUrl={this.getSearchUrl}
                renderOption={this.renderOption}
                getOptionLabel={this.getOptionLabel}
                required
            />
        );
    }

    private renderOption = (option: SearchItem, state: RenderOptionState) => {
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

    private getOptionLabel(option?: SearchItem): string {
        return option?.name || '';
    }

    private getSearchUrl = (text: string) => {
        return `${baseRequestUrl}/search?type=${this.props.rule.param}&text=${encodeURIComponent(text)}`;
    }
}
