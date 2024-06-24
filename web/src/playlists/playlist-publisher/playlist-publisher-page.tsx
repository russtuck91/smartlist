import { Box, CircularProgress, IconButton, Typography } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import React from 'react';
import { useParams } from 'react-router-dom';

import { SecondaryAppBar } from '../../core/components/secondary-app-bar';
import goBackOrBackupUrl from '../../core/history/go-back-or-backup-url';
import { RouteLookup } from '../../core/routes/route-lookup';

import { useFetchPlaylist } from '../use-fetch-playlist';

import PlaylistPublisherContent from './playlist-publisher-content';


interface MatchParams {
    id: string
}

const PlaylistPublisherPage = () => {
    const params = useParams<MatchParams>();
    const { data: playlist, isLoading } = useFetchPlaylist(params.id);

    return (
        <Box display="flex" flex="1 1 auto" flexDirection="column" overflow="auto">
            <SecondaryAppBar>
                <IconButton onClick={() => goBackOrBackupUrl(RouteLookup.playlists.base)}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6">
                    Publish Playlist
                </Typography>
            </SecondaryAppBar>
            {isLoading ? (
                <Box flex="1 1 auto" display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                <PlaylistPublisherContent playlist={playlist!} />
            )}
        </Box>
    );
};

export default PlaylistPublisherPage;
