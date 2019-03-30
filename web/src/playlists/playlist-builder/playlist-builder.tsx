import * as React from 'react';
import { Formik, FormikProps } from 'formik';

import { PlaylistBuilderForm } from './playlist-builder-form';
import { PlaylistBuilderFormValues } from './models';
import './playlist-builder.scss';

export class PlaylistBuilder extends React.Component {
    render() {
        return (
            <Formik
                initialValues={{
                    title: ''
                }}
                onSubmit={this.onSubmit}
                render={(formikProps: FormikProps<PlaylistBuilderFormValues>) => (
                    <PlaylistBuilderForm
                        formik={formikProps}
                    />
                )}
            />
        );
    }

    private onSubmit(values: PlaylistBuilderFormValues) {
        console.log('in onSubmit');
        console.log(values);
    }
}