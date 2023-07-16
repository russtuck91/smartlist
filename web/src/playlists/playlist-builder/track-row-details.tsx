import {
    Box, CircularProgress, Grid, Paper,
    Theme, WithStyles, withStyles,
} from '@material-ui/core';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import React from 'react';

import { Track, TrackDetails } from '../../../../shared';

import { baseRequestUrl, requests } from '../../core/requests/requests';


interface TrackRowDetailsProps {
    track: Track;
}

const useStyles = (theme: Theme) => ({
    paper: {
        backgroundColor: theme.palette.background.secondary,
        marginBottom: theme.spacing(1),

        '& .MuiGrid-container': {
            margin: 0,
        },
    },
});

type FullProps = TrackRowDetailsProps & WithStyles<typeof useStyles>;

function RawTrackRowDetails(props: FullProps) {
    const query = useQuery<TrackDetails>({
        queryKey: ['trackDetails', props.track.id],
        queryFn: async () => {
            return await requests.get(`${baseRequestUrl}/track/${props.track.id}/details`);
        },
        staleTime: (60 * 60 * 1000),
        refetchOnWindowFocus: false,
    });

    function renderContent() {
        if (query.isLoading || !query.data) {
            return (
                <Box display="flex" justifyContent="center" p={1}>
                    <CircularProgress />
                </Box>
            );
        }

        return (
            <Grid container spacing={2}>
                <Grid item>
                    <strong>Genres:</strong>
                    <Box maxHeight="6em" overflow="auto">
                        {query.data.genres.map((genre, index) => (
                            <div key={index}>{genre}</div>
                        ))}
                    </Box>
                </Grid>
                <Grid item>
                    <div>
                        <strong>Year: </strong>
                        {moment(props.track.albumReleaseDate).format('YYYY')}
                    </div>
                    <div>
                        <strong>Tempo: </strong>
                        {query.data.audioFeatures.tempo}
                    </div>
                    <div>
                        <strong>Energy: </strong>
                        {query.data.audioFeatures.energy}
                    </div>
                    <div>
                        <strong>Instrumentalness: </strong>
                        {query.data.audioFeatures.instrumentalness}
                    </div>
                </Grid>
            </Grid>
        );
    }

    return (
        <Paper className={props.classes.paper}>
            {renderContent()}
        </Paper>
    );
}

export const TrackRowDetails = withStyles(useStyles)(RawTrackRowDetails);
