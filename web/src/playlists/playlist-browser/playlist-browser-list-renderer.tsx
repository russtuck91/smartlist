import {
    Box, List, Paper,
    StyleRules, Theme, WithStyles, withStyles,
} from '@material-ui/core';
import classNames from 'classnames';
import React from 'react';

import { Playlist } from '../../../../shared';

import PlaylistBrowserItemRenderer from './playlist-browser-item-renderer';


interface PlaylistBrowserListRendererProps {
    playlists: Playlist[];
    isLoading: boolean;
    onClickListItem: (playlist: Playlist) => void;
    onClickPublishBtn: (playlist: Playlist) => void;
    onClickDeleteBtn: (playlist: Playlist) => void;
}

const useStyles = (theme: Theme): StyleRules => ({
    listContainer: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        overflowY: 'auto',

        '& .MuiAlert-root': {
            fontSize: 'inherit',
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            '& .MuiAlert-icon': {
                padding: 0,
                marginRight: theme.spacing(1),
                fontSize: '1.3em',
            },
            '& .MuiAlert-message': {
                padding: 0,
            },
        },

        '& .MuiButton-root': {
            margin: theme.spacing(0.5),
        },
    },
    listContainerLoading: {
        overflow: 'hidden',
    },
});

type FullProps = PlaylistBrowserListRendererProps & WithStyles<typeof useStyles>;

export class RawPlaylistBrowserListRenderer extends React.Component<FullProps> {
    render() {
        const { playlists } = this.props;

        return (
            <Paper
                className={classNames(this.props.classes.listContainer, {
                    [this.props.classes.listContainerLoading]: this.props.isLoading,
                })}
            >
                {!this.props.isLoading && playlists.length === 0 ? (
                    <Box
                        display="flex"
                        flex="1 1 auto"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        p={4}
                    >
                        You have no playlists. Create a new playlist and it will show up here.
                    </Box>
                ) : (
                    <List>
                        {(this.props.isLoading ?
                            Array(100).fill({}) :
                            playlists
                        ).map(this.renderPlaylistItem)}
                    </List>
                )}
            </Paper>
        );
    }

    private renderPlaylistItem = (playlist: Playlist, index: number, playlists: Playlist[]) => {
        return (
            <PlaylistBrowserItemRenderer
                key={index}
                playlist={playlist}
                index={index}
                playlists={playlists}
                isLoading={this.props.isLoading}
                onClickListItem={this.props.onClickListItem}
                onClickPublishBtn={this.props.onClickPublishBtn}
                onClickDeleteBtn={this.props.onClickDeleteBtn}
            />
        );
    };
}

export const PlaylistBrowserListRenderer = withStyles(useStyles)(RawPlaylistBrowserListRenderer);
