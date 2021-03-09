import { FormikProps } from 'formik';
import React from 'react';

import { Playlist, PlaylistDeleteOptions } from '../../../../../shared';

import { DialogControl } from '../../../core/components/modals/dialog-control';
import { CheckboxField } from '../../../core/forms/fields';

interface DeleteDialogRendererProps {
    isOpen: boolean;
    onClose: () => void;
    formikProps: FormikProps<PlaylistDeleteOptions>;
    playlist?: Playlist;
}

export class DeleteDialogRenderer extends React.Component<DeleteDialogRendererProps> {
    render() {
        return (
            <DialogControl
                open={this.props.isOpen}
                onClose={this.props.onClose}
                onConfirm={this.props.formikProps.submitForm}
                title={`Delete ${this.props.playlist?.name || 'Playlist'}`}
                body={this.renderDeleteModalBody()}
            />
        );
    }

    private renderDeleteModalBody() {
        const { playlist } = this.props;

        return (
            <div>
                <p>Are you sure you want to delete this playlist?</p>
                {playlist && playlist.spotifyPlaylistId && !playlist.deleted ? (
                    <CheckboxField
                        id="deleteSpotifyPlaylist"
                        label="Also delete the playlist on Spotify?"
                    />
                ) : null}
            </div>
        );
    }
}
