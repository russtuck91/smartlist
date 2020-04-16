import { Playlist } from '../../../../../shared';

export interface PlaylistBuilderFormValues extends Pick<Playlist, 'name'|'rules'> {
    
}