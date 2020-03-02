import Agenda from 'agenda';

import * as playlistService from '../services/playlist-service';

export default function(agenda: Agenda) {
    agenda.define('playlistPublishing', async (job) => {
        console.log('in playlistPublishing job');

        try {
            await playlistService.publishAllPlaylists();
        } catch (e) {
            console.log('error in playlistPublishing');
            console.log(e);
        }
    });
}
