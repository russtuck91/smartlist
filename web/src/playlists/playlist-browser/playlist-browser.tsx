import { Button, Link } from '@material-ui/core';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { RouteLookup } from '../../core/routes/route-lookup';

export class PlaylistBrowser extends React.Component<any> {
    render() {
        return (
            <div>
                <h1>Playlists</h1>
                <Link to={RouteLookup.playlists.create} component={RouterLink}><Button>Create New Playlist</Button></Link>
            </div>
        );
    }

    private transitionToBuilder = () => {
        this.props.history.push(RouteLookup.playlists.create);
    }
}