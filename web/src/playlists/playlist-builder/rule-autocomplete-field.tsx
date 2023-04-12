import {
    Avatar, IconButton, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText,
} from '@material-ui/core';
import { OpenInNew } from '@material-ui/icons';
import React from 'react';
import LazyLoad from 'react-lazyload';

import {
    findImageAtLeastSize,
    isAlbumObjectSimplified, isPlaylistObjectSimplified,
    isTrackObjectFull,
    PlaylistRule, SearchItem,
} from '../../../../shared';

import { AutocompleteField } from '../../core/forms/fields';
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

    private renderOption = (option: SearchItem) => {
        return (
            <ListItem ContainerComponent="div" dense disableGutters>
                <ListItemAvatar>
                    <Avatar>
                        <LazyLoad overflow offset={5000}>
                            <img src={findImageAtLeastSize((isTrackObjectFull(option) ? option.album.images : option.images), 40)?.url} />
                        </LazyLoad>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={option.name}
                    secondary={this.getSecondaryText(option)}
                />
                <ListItemSecondaryAction onClick={(e) => e.stopPropagation()}>
                    <IconButton edge="end" href={option.external_urls.spotify} target="_blank">
                        <OpenInNew fontSize="small" />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        );
    };

    private getSecondaryText(option: SearchItem) {
        if (isAlbumObjectSimplified(option)) {
            return option.artists.map((a) => a.name).join(' \u25CF ');
        }
        if (isTrackObjectFull(option)) {
            return option.artists.map((a) => a.name).join(' \u25CF ');
        }
        if (isPlaylistObjectSimplified(option)) {
            return `Created by ${option.owner.display_name}`;
        }
    }

    private getOptionLabel(option?: SearchItem): string {
        return option?.name || '';
    }

    private getSearchUrl = (text: string) => {
        return `${baseRequestUrl}/search?type=${this.props.rule.param}&text=${encodeURIComponent(text)}`;
    };
}
