import {
    Box, Button, CircularProgress,
    ListItem, ListItemText,
    StyleRules, Theme, WithStyles, withStyles,
} from '@material-ui/core';
import { Delete, Publish } from '@material-ui/icons';
import { Alert, Skeleton } from '@material-ui/lab';
import { useIsMutating } from '@tanstack/react-query';
import classNames from 'classnames';
import { random } from 'lodash';
import React from 'react';

import { Playlist } from '../../../../shared';

import SmTooltip from '../../core/components/tooltips/sm-tooltip';
import { toDateTimeFormat } from '../../core/utils';

import { getPlaylistPublishKey } from '../use-playlist-publish';


interface PlaylistBrowserItemRendererProps {
    playlist: Playlist;
    index: number;
    playlists: Playlist[];
    isLoading: boolean;
    onClickListItem: (playlist: Playlist) => void;
    onClickPublishBtn: (playlist: Playlist) => void;
    onClickDeleteBtn: (playlist: Playlist) => void;
}

const useStyles = (theme: Theme): StyleRules => ({
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

type FullProps = PlaylistBrowserItemRendererProps & WithStyles<typeof useStyles>;

const RawPlaylistBrowserItemRenderer: React.FC<FullProps> = (props) => {
    const isPublishInProgress = !!useIsMutating({ mutationKey: getPlaylistPublishKey(props.playlist.id) });

    return (
        <ListItem
            divider={props.index < props.playlists.length - 1}
            button={!props.isLoading as any}
            onClick={props.isLoading ? undefined : () => props.onClickListItem(props.playlist)}
        >
            <ListItemText
                primary={props.isLoading ? <Skeleton width={`${random(4, 9)}em`} /> : props.playlist.name}
                secondary={props.isLoading ? <Skeleton width="16em" /> : (
                    <>
                        Last Published:
                        {' '}
                        {renderLastPublishedValue()}
                    </>
                )}
            />
            <Box
                className={classNames(props.classes.actionArea, {
                    [props.classes.actionAreaLoading]: props.isLoading,
                })}
            >
                <Button
                    variant="contained"
                    size="small"
                    onClick={(event) => {
                        props.onClickPublishBtn(props.playlist);
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
                        props.onClickDeleteBtn(props.playlist);
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

    function renderLastPublishedValue() {
        if (isPublishInProgress) {
            return <CircularProgress size={20} />;
        }

        if (props.playlist.deleted) {
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

        if (!props.playlist.lastPublished) {
            return '--';
        }
        return toDateTimeFormat(props.playlist.lastPublished);
    }
};

const PlaylistBrowserItemRenderer = withStyles(useStyles)(RawPlaylistBrowserItemRenderer);

export default PlaylistBrowserItemRenderer;
