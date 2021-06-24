import { Button, Container, Grid, Link, StyleRules, Theme, Typography, WithStyles, withStyles } from '@material-ui/core';
import classNames from 'classnames';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { RouteLookup } from '../core/routes/route-lookup';
import isUserLoggedIn from '../core/session/is-user-logged-in';

import alexaLogo from './images/alexa-logo.png';
import cortanaLogo from './images/cortana-logo.png';
import googleAssistantLogo from './images/google-assistant-logo.png';
import ruleField from './images/rule-field.png';
import ruleGroup from './images/rule-group.png';
import siriLogo from './images/siri-logo.png';
import spotifyLogo from './images/spotify-logo.png';

interface HomeProps {}

const useStyles = (theme: Theme): StyleRules => ({
    homepage: {
        textAlign: 'center',
        overflow: 'auto',
        flex: '1 1 auto',
        paddingBottom: theme.spacing(8),

        '& p': {
            '& strong': {
                letterSpacing: 1,
            },
        },

        '& .MuiButton-root': {
            marginTop: '4em',
        },
    },
    title: {
        fontSize: '2.4em',
        letterSpacing: 3,
        fontWeight: 200,

        '& span:first-child': {
            fontWeight: 'bold',
        },
    },
    subtitle: {
        fontSize: '1.3em',
        marginBottom: '3em',
        textTransform: 'uppercase',
        letterSpacing: 5,
    },
    featureRow: {
        [theme.breakpoints.down('xs')]: {
            padding: `${theme.spacing(3)}px 0`,
        },

        '& > .MuiGrid-item': {
            padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,

            [theme.breakpoints.up('sm')]: {
                padding: `${theme.spacing(3)}px ${theme.spacing(4)}px`,
                '&:first-child': {
                    textAlign: 'right',
                    border: 0,
                    borderRightWidth: 1,
                    borderStyle: 'solid',
                },
                '&:last-child': {
                    textAlign: 'left',
                },
            },
        },
    },
    section: {
        marginTop: theme.spacing(8),
        paddingTop: theme.spacing(8),
        marginBottom: theme.spacing(8),
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',

        '& .MuiTypography-h5': {
            fontWeight: 'bold',
            marginBottom: theme.spacing(2),
        },

        '& .MuiGrid-container': {
            marginTop: 0,
            marginBottom: 0,
        },

        '& img': {
            maxWidth: '100%',
        },
    },
    usePlaylistsSection: {
        '& img': {
            width: '4em',
        },
        '& q': {
            display: 'block',
            fontSize: '1.2em',
            fontStyle: 'italic',
            letterSpacing: 1,
            lineHeight: '1.2em',
            padding: theme.spacing(2),
            '&:before, &:after': {
                fontSize: '2em',
                position: 'relative',
                fontWeight: 'bold',
                fontFamily: 'cursive',
            },
            '&:before': {
                right: theme.spacing(2),
            },
            '&:after': {
                left: theme.spacing(1),
            },

            '& em': {
                color: theme.palette.primary['200'],
            },
        },
    },
});

type FullProps = HomeProps & WithStyles<typeof useStyles>;

export class RawHome extends React.Component<FullProps> {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.homepage}>
                <Container>
                    <h1 className={classes.title}>
                        <span>smart</span>
                        <span>list</span>
                    </h1>

                    <h3 className={classes.subtitle}>Automatic Spotify playlists by rules</h3>

                    <Grid container className={classes.featureRow}>
                        <Grid item xs={12} sm={4} md={5}>
                            <strong>SET IT</strong>
                        </Grid>
                        <Grid item xs={12} sm>
                            <span>Set up playlists based on simple rules</span>
                        </Grid>
                    </Grid>

                    <Grid container className={classes.featureRow}>
                        <Grid item xs={12} sm={4} md={5}>
                            <strong>FORGET IT</strong>
                        </Grid>
                        <Grid item xs={12} sm>
                            <span>Playlists are automatically updated at regular intervals</span>
                        </Grid>
                    </Grid>

                    {this.renderCTAButton()}
                    {this.renderHowItWorksSection()}
                    {this.renderSamplePlaylistsSection()}
                    {this.renderUseYourPlaylistsSection()}
                    {this.renderCTAButton()}
                </Container>
            </div>
        );
    }

    private renderCTAButton() {
        return (
            <Link component={RouterLink} underline="none" to={isUserLoggedIn() ? RouteLookup.playlists.base : RouteLookup.login.base}>
                <Button variant="contained" color="primary">Get started</Button>
            </Link>
        );
    }

    private renderHowItWorksSection() {
        return (
            <div className={this.props.classes.section}>
                <Typography variant="h5">How It Works</Typography>
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        Define individual rules as building blocks
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <img src={ruleField} />
                    </Grid>
                </Grid>
                <Grid container spacing={10} alignItems="center" direction="row-reverse">
                    <Grid item xs={12} sm={6}>
                        Put those rules together in groups
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <img src={ruleGroup} />
                    </Grid>
                </Grid>
                <Grid container spacing={10} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <p>AND groups match songs for all of the rules</p>
                        <p>OR groups match songs for any of the rules</p>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        MORE IMAGE
                    </Grid>
                </Grid>
            </div>
        );
    }

    private renderSamplePlaylistsSection() {
        return (
            <div className={this.props.classes.section}>
                <Typography variant="h5">Create Smart Playlists such as</Typography>
                <Grid container spacing={8}>
                    <Grid item xs={6} sm={4}>
                        saved songs from your fav artist
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        a mashup of saved songs from 2 artists
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        saved songs of a genre
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        saved songs from a year or a decade
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        XXX
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        XXX
                    </Grid>
                </Grid>
            </div>
        );
    }

    private renderUseYourPlaylistsSection() {
        const { classes } = this.props;
        return (
            <div className={classNames(classes.section, classes.usePlaylistsSection)}>
                <Typography variant="h5">Using your playlist is as easy as</Typography>

                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <div><img src={spotifyLogo} /></div>
                        <Typography variant="h6">Open in Spotify and Play!</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container justify="center" spacing={4}>
                            <Grid item><img src={alexaLogo} /></Grid>
                            <Grid item><img src={siriLogo} /></Grid>
                            <Grid item><img src={googleAssistantLogo} /></Grid>
                            <Grid item><img src={cortanaLogo} /></Grid>
                        </Grid>
                        <Typography variant="h6">Call your voice assistant and say</Typography>
                        <q>
                            <strong>Play</strong>
                            {' '}
                            <em>My Billy Joel</em>
                        </q>

                        <div style={{ marginTop: '2em' }}>Also try</div>
                        <q>
                            <strong>Play</strong>
                            {' '}
                            The Playlist
                            {' '}
                            <em>Saved Classical</em>
                        </q>
                        <q>
                            <strong>Shuffle</strong>
                            {' '}
                            Playlist
                            {' '}
                            <em>Chill Pop</em>
                        </q>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const Home = withStyles(useStyles)(RawHome);
