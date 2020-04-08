import { Button, Container, Link, StyleRules, Theme, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { RouteLookup } from './core/routes/route-lookup';

interface HomeProps {}

const useStyles = (theme: Theme) => {
    const rules: StyleRules = {
        homepage: {
            textAlign: 'center',

            '& p': {
                '& strong': {
                    letterSpacing: 1
                }
            },

            '& .MuiButton-root': {
                marginTop: '4em'
            }
        },
        title: {
            fontSize: '2.4em',
            letterSpacing: 3,
            fontWeight: 200,

            '& span:first-child': {
                fontWeight: 'bold'
            }
        },
        subtitle: {
            fontSize: '1.3em',
            marginBottom: '3em',
            textTransform: 'uppercase',
            letterSpacing: 5
        },
        separator: {
            marginLeft: '1.4em',
            marginRight: '1.4em'
        }
    };
    return rules;
};

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

                <p>
                    <strong>SET IT</strong>
                    <span className={classes.separator}>|</span>
                    <span>Set up playlists based on simple rules</span>
                </p>
                <p>
                    <strong>FORGET IT</strong>
                    <span className={classes.separator}>|</span>
                    <span>Playlists are automatically updated at regular intervals</span>
                </p>
                
                {/* TODO: change button based on logged in status, existing playlists */}
                <Link component={RouterLink} underline="none" to={RouteLookup.login.base}>
                    <Button variant="contained" color="primary">Get started</Button>
                </Link>
            </Container>
        );
    }
}

export const Home = withStyles(useStyles)(RawHome);