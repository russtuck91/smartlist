import { FormikProps } from 'formik';
import * as React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { Column } from '../../core/components/column';
import { TextInput } from '../../core/forms/fields';

import { PlaylistBuilderFormValues } from './models';
import { requests, baseRequestUrl } from '../../core/requests/requests';

export interface PlaylistBuilderFormProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
}

interface PlaylistBuilderFormState {
    listPreview?: any;
}

export class PlaylistBuilderForm extends React.Component<PlaylistBuilderFormProps, PlaylistBuilderFormState> {
    state: PlaylistBuilderFormState = {};

    componentDidMount() {
        this.getListPreview();
    }

    async getListPreview() {
        const list = await requests.post(`${baseRequestUrl}/playlists/populateList`, []);

        this.setState({
            listPreview: list
        });
    }

    render() {
        const { formik } = this.props;
        const { values, handleSubmit } = formik;

        return (
            <form id="playlist-builder" onSubmit={handleSubmit}>
                <h1>Playlist Builder</h1>
                <Row>
                    <Column>
                        {this.renderFormArea()}
                    </Column>
                    <Column>
                        {this.renderPreviewArea()}
                    </Column>
                </Row>
            </form>
        );
    }

    private renderFormArea() {
        const { formik } = this.props;
        const { values } = formik;

        return (
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
        );
    }

    private renderPreviewArea() {
        console.log(this.state.listPreview);
        return (
            <div id="preview-area"></div>
        );
    }
}