import * as React from 'react';
import { Route, Switch } from 'react-router';

import { baseRequestUrl } from '../core/requests/requests';
import { RouteLookup } from '../core/routes/route-lookup';

import { PlaylistBrowser } from './playlist-browser/playlist-browser';
import { PlaylistBuilder } from './playlist-builder/playlist-builder';

export class PlaylistContainer extends React.Component {
    static requestUrl = `${baseRequestUrl}/playlists`;

    render() {
        return (
            <Switch>
                <Route exact path={RouteLookup.playlists.create} component={PlaylistBuilder} />
                <Route path={RouteLookup.playlists.edit} component={PlaylistBuilder} />
                <Route exact path={RouteLookup.playlists.base} component={PlaylistBrowser} />
            </Switch>
        );
    }
}