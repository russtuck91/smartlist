import { Formik } from 'formik';
import React from 'react';

import { Playlist, PlaylistDeleteOptions } from '../../../../../shared';

import { DeleteDialogRenderer } from './delete-dialog-renderer';

interface DeleteDialogContainerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (values: PlaylistDeleteOptions) => void;
    playlist?: Playlist;
}

export class DeleteDialogContainer extends React.Component<DeleteDialogContainerProps> {
    render() {
        return (
            <Formik
                initialValues={this.getInitialValues()}
                onSubmit={this.props.onConfirm}
            >
                {(formikProps) => (
                    <DeleteDialogRenderer
                        formikProps={formikProps}
                        isOpen={this.props.isOpen}
                        onClose={this.props.onClose}
                        playlist={this.props.playlist}
                    />
                )}
            </Formik>
        );
    }

    private getInitialValues(): PlaylistDeleteOptions {
        return {
            deleteSpotifyPlaylist: false,
        };
    }
}
