import { Playlist } from '../../../../../shared/src/playlists/models';

export interface PlaylistBuilderFormValues extends Pick<Playlist, 'name'|'rules'> {
    
}