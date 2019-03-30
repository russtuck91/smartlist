import * as React from 'react';
import { FormikProps } from 'formik';

import { TextInput } from '../../core/forms/fields';
import { PlaylistBuilderFormValues } from './models';
import { Button, Col, Row } from 'react-bootstrap';

export interface PlaylistBuilderFormProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
}

export class PlaylistBuilderForm extends React.Component<PlaylistBuilderFormProps> {
    render() {
        const { formik } = this.props;
        const { values, handleSubmit } = formik;

        return (
            <form id="playlist-builder" onSubmit={handleSubmit}>
                <h1>Playlist Builder</h1>
                <Row>
                    <Col>
                        <TextInput
                            id="title"
                            value={values.title}
                        />
                    </Col>
                    <Col>
                        <Button type="submit">Save</Button>
                    </Col>
                </Row>
            </form>
        );
    }
}