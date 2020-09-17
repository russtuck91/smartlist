import { Button, ButtonGroup, Grid, Paper } from '@material-ui/core';
import { FormikProps } from 'formik';
import { get } from 'lodash';
import * as React from 'react';

import { isPlaylistRuleGroup, PlaylistRule, PlaylistRuleGroup, RuleGroupType } from '../../../../shared';
import { convertEnumToArray } from '../../../../shared/src/util/object-util';

import { DEFAULT_NEW_CONDITION, PlaylistBuilderFormValues } from './models';
import { RuleField } from './rule-field';


const ruleGroupTypes = convertEnumToArray<RuleGroupType>(RuleGroupType);

interface RuleGroupProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
    ruleGroup: PlaylistRuleGroup;
    treeId: string;
}

export class RuleGroup extends React.Component<RuleGroupProps> {
    render() {
        const { ruleGroup, treeId, formik: { setFieldValue } } = this.props;

        return (
            <Grid item>
                <Paper className="rule-group">
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Grid container justify="space-between">
                                <Grid item>
                                    Type:
                                    {' '}
                                    <ButtonGroup>
                                        {ruleGroupTypes.map((type, index) => (
                                            <Button
                                                key={index}
                                                onClick={() => setFieldValue(`${treeId}.type`, type)}
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
                                            onClick={this.addCondition}
                                            size="small"
                                        >
                                            Add condition
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={this.addGroup}
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
                                return this.renderRuleGroup(rule, index);
                            } else {
                                return this.renderRuleField(rule, index);
                            }
                        })}
                    </Grid>
                </Paper>
            </Grid>
        );
    }

    private renderRuleGroup(rule, index) {
        return (
            <RuleGroup
                key={index}
                formik={this.props.formik}
                ruleGroup={rule}
                treeId={this.getChildRuleTreeId(index)}
            />
        );
    }

    private renderRuleField(rule: PlaylistRule, index: number) {
        return (
            <RuleField
                key={index}
                formik={this.props.formik}
                rule={rule}
                treeId={this.getChildRuleTreeId(index)}
                removeCondition={() => this.removeCondition(index)}
            />
        );
    }

    private getChildRuleTreeId(index: number) {
        return `${this.props.treeId}.rules[${index}]`;
    }

    private addCondition = () => {
        const { treeId, ruleGroup, formik: { setFieldValue } } = this.props;
        
        ruleGroup.rules.push(DEFAULT_NEW_CONDITION);
        setFieldValue(`${treeId}.rules`, ruleGroup.rules);
    }

    private addGroup = () => {
        const { treeId, ruleGroup, formik: { setFieldValue } } = this.props;
        
        ruleGroup.rules.push({ type: RuleGroupType.And, rules: [ DEFAULT_NEW_CONDITION ] });
        setFieldValue(`${treeId}.rules`, ruleGroup.rules);
    }

    private removeCondition(indexToRemove: number) {
        const { ruleGroup, treeId, formik: { values, setFieldValue } } = this.props;

        ruleGroup.rules.splice(indexToRemove, 1);

        // if condition is now empty, remove it
        if (ruleGroup.rules.length === 0) {
            const treeIdParts = treeId.split(/\[(\d+)\]$/);

            const containingListId = treeIdParts[0];
            const ruleGroupIndex = parseInt(treeIdParts[1]);

            const newContainingListVal = get(values, containingListId);
            newContainingListVal.splice(ruleGroupIndex, 1);
            setFieldValue(containingListId, newContainingListVal);
        } else {
            setFieldValue(`${treeId}.rules`, ruleGroup.rules);
        }
    }
}