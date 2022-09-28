import { Box, Button, CircularProgress, List, ListItem, ListItemText, Paper, StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import { Delete, Publish } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import React from 'react';

import { Playlist } from '../../../../shared';

import SmTooltip from '../../core/components/tooltips/sm-tooltip';
import { toDateTimeFormat } from '../../core/utils';


interface PlaylistBrowserListRendererProps {
    playlists: Playlist[];
    isLoading: boolean;
    publishInProgress: { [id: string]: boolean };
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
    actionArea: {
        display: 'flex',

        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
});

type FullProps = PlaylistBrowserListRendererProps & WithStyles<typeof useStyles>;

export class RawPlaylistBrowserListRenderer extends React.Component<FullProps> {
    render() {
        const { playlists } = this.props;

        if (this.props.isLoading) {
            return (
                <Box display="flex" justifyContent="center">
                    <CircularProgress size={60} />
                </Box>
            );
        }

        return (
            <Paper className={this.props.classes.listContainer}>
                {playlists.length === 0 ? (
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
                        {playlists.map(this.renderPlaylistItem)}
                    </List>
                )}
            </Paper>
        );
    }

    private renderPlaylistItem = (playlist: Playlist, index: number, playlists: Playlist[]) => {
        return (
            <ListItem
                key={index}
                divider={index < playlists.length - 1}
                button
                onClick={() => this.props.onClickListItem(playlist)}
            >
                <ListItemText
                    primary={playlist.name}
                    secondary={(
                        <>
                            Last Published:
                            {' '}
                            {this.renderLastPublishedValue(playlist)}
                        </>
                    )}
                />
                <Box className={this.props.classes.actionArea}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(event) => {
                            this.props.onClickPublishBtn(playlist);
                            event.stopPropagation();
                            event.preventDefault();
                        }}
                        startIcon={<Publish fontSize="small" />}
                    >
                        Publish
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(event) => {
                            this.props.onClickDeleteBtn(playlist);
                            event.stopPropagation();
                            event.preventDefault();
                        }}
                        startIcon={<Delete fontSize="small" />}
                    >
                        Delete
                    </Button>
                </Box>
            </ListItem>
        );
    };

    private renderLastPublishedValue(playlist: Playlist) {
        const isPublishInProgress: boolean = this.props.publishInProgress[playlist.id];
        if (isPublishInProgress) {
            return <CircularProgress size={20} />;
        }

        if (playlist.deleted) {
            const title = (
                <div>
                    Playlist was deleted from Spotify.
                    <br />
                    Re-publish to resume automatic updates.
                </div>
            );
            return (
                <SmTooltip title={title}>
                    <Alert severity="error">
                        Deleted
                    </Alert>
                </SmTooltip>
            );
        }

        if (!playlist.lastPublished) {
            return '--';
        }
        return toDateTimeFormat(playlist.lastPublished);
    }
}

export const PlaylistBrowserListRenderer = withStyles(useStyles)(RawPlaylistBrowserListRenderer);
