import { FormikProps } from 'formik';
import { get } from 'lodash';
import { Button, IconButton, Grid, ButtonGroup, Paper, Theme, WithStyles, withStyles, StyleRules, CircularProgress } from '@material-ui/core';
import { RemoveCircleOutline } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as React from 'react';

import { PlaylistRuleGroup, RuleGroupType, RuleParam, PlaylistRule, isPlaylistRuleGroup } from '../../../../shared';
import { objectUtil } from '../../../../shared/src/util/object-util';

import { DropdownField, TextField, CheckboxField } from '../../core/forms/fields';
import { requests } from '../../core/requests/requests';

import { PlaylistContainer } from '../playlist-container';
import { PlaylistBuilderFormValues } from './models';
import { TableRenderer } from '../../core/components/tables/table-renderer';
import { ColumnSet } from '../../core/components/tables/models';
import { Nullable } from '../../core/shared-models/types';

export interface PlaylistBuilderFormProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
}

interface PlaylistBuilderFormState {
    listPreview?: Nullable<SpotifyApi.TrackObjectFull[]>;
}

const useStyles = (theme: Theme) => {
    const rules: StyleRules = {
        previewArea: {
            position: 'fixed',
            top: 65,
            bottom: 0,
            overflowY: 'auto'
        }
    };
    return rules;
};

type FullProps = PlaylistBuilderFormProps & WithStyles<typeof useStyles>;

export class RawPlaylistBuilderForm extends React.Component<FullProps, PlaylistBuilderFormState> {
    state: PlaylistBuilderFormState = {};

    private DEFAULT_NEW_CONDITION: PlaylistRule = { param: RuleParam.Artist, value: '' };

    private ruleGroupTypes = objectUtil.convertEnumToArray<RuleGroupType>(RuleGroupType);
    private ruleParams = objectUtil.convertEnumToArray(RuleParam);

    private listPreviewColumnSet: ColumnSet<SpotifyApi.TrackObjectFull> = [
        { title: 'Name', mapsToField: 'name' },
        { title: 'Artist', mapsToField: 'artists[0].name' },
        { title: 'Album', mapsToField: 'album.name' }
    ];

    componentDidMount() {
        this.getListPreview();
    }

    getListPreview = async () => {
        const { values, isValid } = this.props.formik;

        if (!isValid) {
            this.setState({ listPreview: null });
            return;
        }
        this.setState({ listPreview: undefined });

        try {
            const list = await requests.post(`${PlaylistContainer.requestUrl}/populateList`, values.rules);

            this.setState({
                listPreview: list
            });
        } catch (e) {
            console.log(e);
            this.setState({ listPreview: null });
        }
    }

    render() {
        const { formik } = this.props;
        const { handleSubmit } = formik;

        return (
            <form id="playlist-builder" onSubmit={handleSubmit}>
                <h5>Playlist Builder</h5>
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
        const { values, isValid, isSubmitting } = formik;

        return (
            <Grid container spacing={2}>
                <Grid item container spacing={2} alignItems="flex-end">
                    <Grid item xs>
                        <TextField
                            id="name"
                            value={values.name}
                            label="Name"
                            required
                        />
                    </Grid>
                    <Grid item>
                        <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>Save</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" disabled={!isValid} onClick={this.getListPreview}>Refresh</Button>
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
        const { setFieldValue } = this.props.formik;

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
                                                onClick={() => setFieldValue(`${thisItemTreeId}.type`, type)}
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
                        {thisItemValue.param === RuleParam.Saved ? (
                            <CheckboxField
                                id={`${thisItemTreeId}.value`}
                                value={thisItemValue.value}
                            />
                        ) : (
                            <TextField
                                id={`${thisItemTreeId}.value`}
                                value={thisItemValue.value}
                                required
                            />
                        )}
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
        const { classes } = this.props;
        return (
            <div className={classes.previewArea}>
                {this.renderPreviewContent()}
            </div>
        );
    }

    private renderPreviewContent() {
        const { listPreview } = this.state;
        
        if (listPreview === undefined) {
            return <CircularProgress />;
        }

        if (listPreview === null) {
            return <Alert severity="error">There was a problem loading the playlist. Please try again.</Alert>;
        }

        return (
            <TableRenderer
                data={listPreview}
                columns={this.listPreviewColumnSet}

                stickyHeader
            />
        );
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
        console.log('in removeCondition');
        console.log('treeId:', treeId);
        const { values, setFieldValue } = this.props.formik;

        const atTreeLoc: PlaylistRuleGroup = get(values, treeId);
        atTreeLoc.rules.splice(indexToRemove, 1);

        // if condition is now empty, remove it
        if (atTreeLoc.rules.length === 0) {
            const treeIdParts = treeId.split(/\[(\d+)\]$/);
            console.log(treeIdParts);

            const containingListId = treeIdParts[0];
            const ruleGroupIndex = parseInt(treeIdParts[1]);

            const newContainingListVal = get(values, containingListId);
            newContainingListVal.splice(ruleGroupIndex, 1);
            setFieldValue(containingListId, newContainingListVal);
        } else {
            setFieldValue(`${treeId}.rules`, atTreeLoc.rules);
        }
    }
}

export const PlaylistBuilderForm = withStyles(useStyles)(RawPlaylistBuilderForm);