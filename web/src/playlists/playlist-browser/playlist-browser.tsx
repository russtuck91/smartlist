import * as React from 'react';
import { Button } from 'react-bootstrap';
import { RouteLookup } from '../../core/routes/route-lookup';

export class PlaylistBrowser extends React.Component<any> {
    render() {
        return (
            <div>
                <h1>Playlists</h1>
                <Button onClick={this.transitionToBuilder}>Create New Playlist</Button>
            </div>
        );
    }

    private transitionToBuilder = () => {
        this.props.history.push(RouteLookup.playlists.create);
    }
}