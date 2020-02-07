import { FormikProps } from 'formik';
import { get } from 'lodash';
import * as React from 'react';
import { Button } from 'react-bootstrap';

import { PlaylistRuleGroup, RuleGroupType, RuleParam, PlaylistRule, isPlaylistRuleGroup } from '../../../../shared/src/playlists/models';

import { Column, Row } from '../../core/components/layout';
import { TextField, DropdownField } from '../../core/forms/fields';
import { baseRequestUrl, requests } from '../../core/requests/requests';

import { PlaylistBuilderFormValues } from './models';

export interface PlaylistBuilderFormProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
}

interface PlaylistBuilderFormState {
    listPreview?: SpotifyApi.TrackObjectFull[];
}

export class PlaylistBuilderForm extends React.Component<PlaylistBuilderFormProps, PlaylistBuilderFormState> {
    state: PlaylistBuilderFormState = {};

    private DEFAULT_NEW_CONDITION: PlaylistRule = { param: RuleParam.Artist, value: '' };

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
        const { handleSubmit } = formik;

        return (
            <form id="playlist-builder" onSubmit={handleSubmit}>
                <h1>Playlist Builder</h1>
                <Row>
                    <Column flexProps={{ flexBasis: '50%' }}>
                        {this.renderFormArea()}
                    </Column>
                    <Column flexProps={{ flexBasis: '50%' }}>
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
            <>
                <Row flexProps={{ flexGrow: 0 }}>
                    <Column>
                        <TextField
                            id="title"
                            value={values.title}
                        />
                    </Column>
                    <Column>
                        <Button type="submit" bsStyle="primary">Save</Button>
                    </Column>
                    <Column>
                        <Button type="submit" bsStyle="primary">Refresh</Button>
                    </Column>
                </Row>
                {this.renderRulesFormArea()}
            </>
        );
    }

    private renderRulesFormArea() {
        const { values } = this.props.formik;
        return (
            <Row>
                {values.rules.map((rule, index) => this.renderRuleGroup(rule, index))}
            </Row>
        );
    }

    private renderRuleGroup = (ruleGroup: PlaylistRuleGroup, groupIndex: number, treeIdPrefix = '') => {
        const thisItemTreeId = `${treeIdPrefix ? treeIdPrefix + '.' : ''}rules[${groupIndex}]`;

        return (
            <div className="rule-group" key={groupIndex}>
                <Row flexProps={{ justifyContent: 'space-between' }}>
                    <div>Type: {ruleGroup.type}</div>
                    <div>
                        <Button onClick={() => this.addCondition(thisItemTreeId)}>Add condition</Button>
                        <Button onClick={() => this.addGroup(thisItemTreeId)}>Add group</Button>
                    </div>
                </Row>
                {ruleGroup.rules.map((rule, index) => {
                    if (isPlaylistRuleGroup(rule)) {
                        return this.renderRuleGroup(rule, index, thisItemTreeId);
                    } else {
                        return this.renderRuleField(rule, index, thisItemTreeId);
                    }
                })}
            </div>
        );
    }

    private renderRuleField(rule: PlaylistRule, index: number, treeIdPrefix: string) {
        const { values } = this.props.formik;
        
        const thisItemTreeId = `${treeIdPrefix}.rules[${index}]`;
        const thisItemValue = get(values, thisItemTreeId);
        return (
            <div className="rule" key={index}>
                {/* TODO: dropdown for param */}
                <DropdownField
                    id={`${thisItemTreeId}.param`}
                    value={thisItemValue.param}
                    options={[]}
                />
                <TextField
                    id={`${thisItemTreeId}.value`}
                    value={thisItemValue.value}
                />
                {/* TODO: remove button */}
            </div>
        );
    }

    private renderPreviewArea() {
        return (
            <div id="preview-area">
                {this.renderPreviewContent()}
            </div>
        );
    }

    private renderPreviewContent() {
        const { listPreview } = this.state;
        
        if (!listPreview) {
            return null;
        }

        return listPreview.map((item, index) => {
            return (
                <div key={index} style={{ marginBottom: 20 }}>
                    <div>{item.name}</div>
                    <div>{item.artists[0].name}</div>
                    <div>{item.album.name}</div>
                </div>
            );
        });
    }

    private addCondition(treeId: string) {
        const { values, setFieldValue } = this.props.formik;
        
        const atTreeLoc: PlaylistRuleGroup = get(values, treeId);
        atTreeLoc.rules.push(this.DEFAULT_NEW_CONDITION);
        setFieldValue(`${treeId}.rules`, atTreeLoc.rules);
    }

    private addGroup(treeId: string) {
        const { values, setFieldValue } = this.props.formik;
        
        const atTreeLoc: PlaylistRuleGroup = get(values, treeId);
        atTreeLoc.rules.push({ type: RuleGroupType.And, rules: [ this.DEFAULT_NEW_CONDITION ] });
        setFieldValue(`${treeId}.rules`, atTreeLoc.rules);
    }
}