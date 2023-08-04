import React from 'react';

import { Playlist } from '../../../../shared';

import { DialogControl } from '../../core/components/modals/dialog-control';

import { usePlaylistPublish } from '../use-playlist-publish';


interface PublishDialogProps {
    showPublishDialog: boolean;
    playlist?: Playlist;
    onClose: () => void;
}

const PublishDialog: React.FC<PublishDialogProps> = ({
    showPublishDialog,
    playlist,
    onClose,
}) => {
    const { mutate: doPublish } = usePlaylistPublish(playlist?.id);

    function handleConfirmPublish() {
        if (!playlist) { return; }

        doPublish();

        onClose();
    }

    return (
        <DialogControl
            open={showPublishDialog}
            onClose={onClose}
            onConfirm={handleConfirmPublish}
            body={<p>Publish this playlist?</p>}
        />
    );
};

export default PublishDialog;
