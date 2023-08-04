import React, { useEffect } from 'react';

import { Playlist } from '../../../../shared';

import { history } from '../../core/history/history';
import { RouteLookup } from '../../core/routes/route-lookup';

import { usePlaylistPublish } from '../use-playlist-publish';


interface PlaylistAfterUpdateActionsProps {
    playlist: Playlist;
}

const PlaylistAfterUpdateActions: React.FC<PlaylistAfterUpdateActionsProps> = ({
    playlist,
}) => {
    const { mutate: doPublish } = usePlaylistPublish(playlist.id);

    useEffect(() => {
        doPublish();

        history.push(RouteLookup.playlists.base);
    }, []);

    return null;
};

export default PlaylistAfterUpdateActions;
