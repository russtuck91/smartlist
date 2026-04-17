import {
    Box, Button, CircularProgress, Container, Link,
} from '@material-ui/core';
import {
    ArrowBack, Check, Edit, OpenInNew, Publish,
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { generatePath, Link as RouterLink } from 'react-router-dom';

import { Playlist } from '../../../../shared';

import { RouteLookup } from '../../core/routes/route-lookup';
import { toDateTimeFormat } from '../../core/utils';

import { usePlaylistPublish } from '../use-playlist-publish';


interface PlaylistPublisherContentProps {
    playlist: Playlist;
}

type FullProps = PlaylistPublisherContentProps;

const PlaylistPublisherContent: React.FC<FullProps> = ({ playlist }) => {
    const { mutate: doPublish, isLoading, isSuccess, isError } = usePlaylistPublish(playlist.id);
    const [justSuccessfulPublish, setJustSuccessfulPublish] = useState(false);

    useEffect(() => {
        if (!isLoading && isSuccess) {
            setJustSuccessfulPublish(true);
            setTimeout(() => {
                setJustSuccessfulPublish(false);
            }, 3000);
        }
    }, [isLoading, isSuccess]);

    return (
        <Container>
            <h4>{playlist.name}</h4>

            <p>
                <span>Last successful publish: </span>
                <span>{!playlist.lastPublished ? '--' : toDateTimeFormat(playlist.lastPublished)}</span>
            </p>

            {playlist.deleted && (
                <Alert severity="error">
                    Playlist was deleted from Spotify. Re-publish to resume automatic updates.
                </Alert>
            )}

            <Box display="flex" justifyContent="center" my={4}>
                <Button
                    variant="contained"
                    startIcon={justSuccessfulPublish ? <Check /> : isLoading ? <CircularProgress size={18} /> : <Publish />}
                    disabled={isLoading}
                    onClick={() => {
                        doPublish();
                    }}
                >
                    Publish Now
                </Button>
            </Box>

            {isError && (
                <Alert severity="error">
                    An error occurred when publishing the playlist. Please try again.
                </Alert>
            )}

            {(isSuccess || isError) && (
                <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
                    {playlist.lastPublished && !playlist.deleted && (
                        <p>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<OpenInNew />}
                                href={`https://open.spotify.com/playlist/${playlist.spotifyPlaylistId}`}
                                target="_blank"
                            >
                                Open on Spotify
                            </Button>
                        </p>
                    )}

                    <p>
                        <Link component={RouterLink} underline="none" to={generatePath(RouteLookup.playlists.edit, { id: playlist.id })}>
                            <Button variant="contained" startIcon={<Edit />}>
                                Edit Playlist
                            </Button>
                        </Link>
                    </p>
                    <p>
                        <Link component={RouterLink} underline="none" to={RouteLookup.playlists.base}>
                            <Button variant="outlined" startIcon={<ArrowBack />}>
                                All Playlists
                            </Button>
                        </Link>
                    </p>
                </Box>
            )}
        </Container>
    );
};

export default PlaylistPublisherContent;
