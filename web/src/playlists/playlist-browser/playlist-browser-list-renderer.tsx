import {
    Box, Button, CircularProgress,
    List, ListItem, ListItemText,
    Paper,
    StyleRules, Theme, WithStyles, withStyles,
} from '@material-ui/core';
import { Delete, Publish } from '@material-ui/icons';
import { Alert, Skeleton } from '@material-ui/lab';
import classNames from 'classnames';
import { random } from 'lodash';
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
    listContainerLoading: {
        overflow: 'hidden',
    },
    actionArea: {
        display: 'flex',

        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
    actionAreaLoading: {
        visibility: 'hidden',
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
            <ListItem
                key={index}
                divider={index < playlists.length - 1}
                button={!this.props.isLoading as any}
                onClick={this.props.isLoading ? undefined : () => this.props.onClickListItem(playlist)}
            >
                <ListItemText
                    primary={this.props.isLoading ? <Skeleton width={`${random(4, 9)}em`} /> : playlist.name}
                    secondary={this.props.isLoading ? <Skeleton width="16em" /> : (
                        <>
                            Last Published:
                            {' '}
                            {this.renderLastPublishedValue(playlist)}
                        </>
                    )}
                />
                <Box
                    className={classNames(this.props.classes.actionArea, {
                        [this.props.classes.actionAreaLoading]: this.props.isLoading,
                    })}
                >
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
