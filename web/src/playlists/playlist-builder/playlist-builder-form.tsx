import { FormikProps } from 'formik';
import { get } from 'lodash';
import { Button, IconButton, Grid, ButtonGroup, Paper } from '@material-ui/core';
import { RemoveCircleOutline } from '@material-ui/icons';
import * as React from 'react';

import { PlaylistRuleGroup, RuleGroupType, RuleParam, PlaylistRule, isPlaylistRuleGroup } from '../../../../shared/src/playlists/models';
import { objectUtil } from '../../../../shared/src/util/object-util';

import { DropdownField, TextField } from '../../core/forms/fields';
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

    private ruleGroupTypes = objectUtil.convertEnumToArray<RuleGroupType>(RuleGroupType);
    private ruleParams = objectUtil.convertEnumToArray(RuleParam);

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
                <Grid container spacing={2}>
                    <Grid item xs>
                        {this.renderFormArea()}
                    </Grid>
                    <Grid item xs>
                        {this.renderPreviewArea()}
                    </Grid>
                </Grid>
            </form>
        );
    }

    private renderFormArea() {
        const { formik } = this.props;
        const { values } = formik;

        return (
            <Grid container spacing={2}>
                <Grid item container spacing={2}>
                    <Grid item xs>
                        <TextField
                            id="name"
                            value={values.name}
                            label="Name"
                        />
                    </Grid>
                    <Grid item>
                        <Button type="submit" variant="contained">Save</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained">Refresh</Button>
                    </Grid>
                </Grid>
                {this.renderRulesFormArea()}
            </Grid>
        );
    }

    private renderRulesFormArea() {
        const { values } = this.props.formik;
        return (
            <Grid item container>
                {values.rules.map((rule, index) => this.renderRuleGroup(rule, index))}
            </Grid>
        );
    }

    private renderRuleGroup = (ruleGroup: PlaylistRuleGroup, groupIndex: number, treeIdPrefix = '') => {
        const thisItemTreeId = `${treeIdPrefix ? treeIdPrefix + '.' : ''}rules[${groupIndex}]`;

        return (
            <Grid key={groupIndex} item>
                <Paper className="rule-group">
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Grid container justify="space-between">
                                <Grid item>
                                    Type:
                                    {' '}
                                    <ButtonGroup>
                                        {this.ruleGroupTypes.map((type, index) => (
                                            <Button
                                                key={index}
                                                onClick={() => this.setGroupType(thisItemTreeId, type)}
                                                size="small"
                                                variant={ruleGroup.type === type ? 'contained' : undefined}
                                            >
                                                {type}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </Grid>
                                <Grid item>
                                    <ButtonGroup>
                                        <Button
                                            variant="contained"
                                            onClick={() => this.addCondition(thisItemTreeId)}
                                            size="small"
                                        >
                                            Add condition
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => this.addGroup(thisItemTreeId)}
                                            size="small"
                                        >
                                            Add group
                                        </Button>
                                    </ButtonGroup>
                                </Grid>
                            </Grid>
                        </Grid>
                        {ruleGroup.rules.map((rule, index) => {
                            if (isPlaylistRuleGroup(rule)) {
                                return this.renderRuleGroup(rule, index, thisItemTreeId);
                            } else {
                                return this.renderRuleField(rule, index, thisItemTreeId);
                            }
                        })}
                    </Grid>
                </Paper>
            </Grid>
        );
    }

    private renderRuleField(rule: PlaylistRule, index: number, treeIdPrefix: string) {
        const { values, handleChange } = this.props.formik;
        
        const thisItemTreeId = `${treeIdPrefix}.rules[${index}]`;
        const thisItemValue = get(values, thisItemTreeId);
        return (
            <Grid item xs={12} key={index}>
                <Grid
                    container
                    wrap="nowrap"
                    alignItems="center"
                    spacing={2}
                    className="rule"
                >
                    <Grid item xs={6}>
                        <DropdownField
                            id={`${thisItemTreeId}.param`}
                            value={thisItemValue.param}
                            options={this.ruleParams}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            id={`${thisItemTreeId}.value`}
                            value={thisItemValue.value}
                        />
                    </Grid>
                    <Grid item xs>
                        <IconButton onClick={() => this.removeCondition(treeIdPrefix, index)}>
                            <RemoveCircleOutline color="error" fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>
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

    private removeCondition(treeId: string, indexToRemove: number) {
        const { values, setFieldValue } = this.props.formik;

        const atTreeLoc: PlaylistRuleGroup = get(values, treeId);
        atTreeLoc.rules.splice(indexToRemove, 1);
        setFieldValue(`${treeId}.rules`, atTreeLoc.rules);

        // TODO: if condition is now empty, remove it
    }

    private setGroupType(treeId: string, value: RuleGroupType) {
        const { values, setFieldValue } = this.props.formik;

        // const atTreeLoc: PlaylistRuleGroup = get(values, treeId);
        // atTreeLoc.type = value;
        setFieldValue(`${treeId}.type`, value);
    }
}