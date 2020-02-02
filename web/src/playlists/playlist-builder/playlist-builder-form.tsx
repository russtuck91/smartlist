import { FormikProps } from 'formik';
import * as React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { Column } from '../../core/components/column';
import { TextInput } from '../../core/forms/fields';

import { PlaylistBuilderFormValues } from './models';
import { requests, baseRequestUrl } from '../../core/requests/requests';
import { PlaylistRuleGroup, RuleGroupType, RuleParam } from '../../../../shared/src/playlists/models';

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
        const dummyRules: PlaylistRuleGroup[] = [
            {
                type: RuleGroupType.And,
                rules: [
                    { param: RuleParam.Artist, value: 'Jukebox the Ghost' }
                ]
            }
        ];
        const list = await requests.post(`${baseRequestUrl}/playlists/populateList`, dummyRules);

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
                    <Button type="submit" bsStyle="primary">Save</Button>
                </Col>
                <Col>
                    <Button type="submit">Refresh</Button>
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