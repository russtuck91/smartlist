import { SpotifyImageObject } from './';

export interface SpotifyUserObject {
    id: string;
    display_name: string;
    email: string;
    images: SpotifyImageObject[];
}