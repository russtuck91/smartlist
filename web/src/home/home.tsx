import { Button, Container, Grid, Link, StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { RouteLookup } from '../core/routes/route-lookup';
import isUserLoggedIn from '../core/session/is-user-logged-in';

interface HomeProps {}

const useStyles = (theme: Theme): StyleRules => ({
    homepage: {
        textAlign: 'center',

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
});

type FullProps = HomeProps & WithStyles<typeof useStyles>;

export class RawHome extends React.Component<FullProps> {
    render() {
        const { classes } = this.props;

        return (
            <Container className={classes.homepage}>
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

                <Link component={RouterLink} underline="none" to={isUserLoggedIn() ? RouteLookup.playlists.base : RouteLookup.login.base}>
                    <Button variant="contained" color="primary">Get started</Button>
                </Link>
            </Container>
        );
    }
}

export const Home = withStyles(useStyles)(RawHome);
