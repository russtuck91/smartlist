import {
    Box, CircularProgress, Grid, Paper,
    Theme, WithStyles, withStyles,
} from '@material-ui/core';
import moment from 'moment';
import React from 'react';

import { Track, TrackDetails } from '../../../../shared';

import { baseRequestUrl, requests } from '../../core/requests/requests';


interface TrackRowDetailsProps {
    track: Track;
}

interface TrackRowDetailsState {
    details?: TrackDetails;
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

export class RawTrackRowDetails extends React.Component<FullProps, TrackRowDetailsState> {
    state: TrackRowDetailsState = {};

    componentDidMount() {
        this.loadTrackDetails();
    }

    private async loadTrackDetails() {
        const details: TrackDetails = await requests.get(`${baseRequestUrl}/track/${this.props.track.id}/details`);
        this.setState({
            details,
        });
    }

    render() {
        return (
            <Paper className={this.props.classes.paper}>
                {this.renderContent()}
            </Paper>
        );
    }

    private renderContent() {
        const { details } = this.state;

        if (!details) {
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
                        {details.genres.map((genre, index) => (
                            <div key={index}>{genre}</div>
                        ))}
                    </Box>
                </Grid>
                <Grid item>
                    <div>
                        <strong>Year: </strong>
                        {moment(this.props.track.albumReleaseDate).format('YYYY')}
                    </div>
                    <div>
                        <strong>Tempo: </strong>
                        {details.audioFeatures.tempo}
                    </div>
                    <div>
                        <strong>Energy: </strong>
                        {details.audioFeatures.energy}
                    </div>
                    <div>
                        <strong>Instrumentalness: </strong>
                        {details.audioFeatures.instrumentalness}
                    </div>
                </Grid>
            </Grid>
        );
    }
}

export const TrackRowDetails = withStyles(useStyles)(RawTrackRowDetails);
