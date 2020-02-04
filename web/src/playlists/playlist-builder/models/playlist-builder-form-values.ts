import { Playlist } from "../../../../../shared/src/playlists/models";

export interface PlaylistBuilderFormValues extends Playlist {
    title: string;
}