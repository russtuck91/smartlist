import { Grid, IconButton } from '@material-ui/core';
import { RemoveCircleOutline } from '@material-ui/icons';
import { FormikProps } from 'formik';
import * as React from 'react';

import { getComparatorsForParam, isYearBetweenRule, isYearIsRule, isYearRule, PlaylistRule, RuleComparator, RuleParam } from '../../../../shared';
import { convertEnumToArray } from '../../../../shared/src/util/object-util';

import { CheckboxField, DropdownField, TextField } from '../../core/forms/fields';
import { AutocompleteField } from '../../core/forms/fields/autocomplete-field';
import { YearPickerField } from '../../core/forms/fields/year-picker-field';

import { getNewConditionByParam, PlaylistBuilderFormValues } from './models';


const ruleParams = convertEnumToArray(RuleParam);

interface RuleFieldProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
    rule: PlaylistRule;
    treeId: string;
    removeCondition: () => void;
}

export class RuleField extends React.Component<RuleFieldProps> {
    render() {
        const { rule, treeId } = this.props;

        const comparators = getComparatorsForParam(rule.param);

        return (
            <Grid item xs={12}>
                <Grid
                    container
                    wrap="nowrap"
                    alignItems="center"
                    spacing={2}
                    className="rule"
                >
                    <Grid item xs={6}>
                        <DropdownField
                            id={`${treeId}.param`}
                            value={rule.param}
                            options={ruleParams}
                            onChange={this.onChangeRuleType}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DropdownField
                            id={`${treeId}.comparator`}
                            value={rule.comparator || (comparators.length === 1 ? comparators[0] : rule.comparator)}
                            options={comparators}
                            disabled={comparators.length <= 1}
                            onChange={this.onChangeComparator}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {this.renderRuleValueField()}
                    </Grid>
                    <Grid item xs>
                        <IconButton onClick={this.props.removeCondition}>
                            <RemoveCircleOutline color="error" fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    private renderRuleValueField() {
        const { rule, treeId } = this.props;

        if (rule.param === RuleParam.Saved) {
            return (
                <CheckboxField
                    id={`${treeId}.value`}
                    value={Boolean(rule.value)}
                    disabled
                />
            );
        }

        if (isYearRule(rule)) {
            if (isYearBetweenRule(rule)) {
                return (
                    <Grid container wrap="nowrap" alignItems="center" spacing={1}>
                        <Grid item xs={6}>
                            <YearPickerField
                                id={`${treeId}.value.start`}
                                required
                            />
                        </Grid>
                        <Grid item>to</Grid>
                        <Grid item xs={6}>
                            <YearPickerField
                                id={`${treeId}.value.end`}
                                required
                            />
                        </Grid>
                    </Grid>
                );
            }

            return (
                <YearPickerField
                    id={`${treeId}.value`}
                    required
                />
            );
        }

        if (
            rule.comparator === RuleComparator.Is &&
            rule.param !== RuleParam.Genre &&
            rule.param !== RuleParam.Year
        ) {
            return (
                <AutocompleteField
                    id={`${treeId}.value`}
                    value={rule.value}
                    type={rule.param}
                    required
                />
            );
        }

        return (
            <TextField
                id={`${treeId}.value`}
                value={rule.value}
                required
            />
        );
    }

    private onChangeRuleType = (e: React.ChangeEvent<any>) => {
        const value: RuleParam = e.target.value;
        const newCondition = getNewConditionByParam(value);

        this.props.formik.setFieldValue(this.props.treeId, newCondition);
    }

    private onChangeComparator = (e: React.ChangeEvent<any>) => {
        const value: RuleComparator = e.target.value;
        const modifiedRule: PlaylistRule = this.getNewRuleFromComparatorChange(value, this.props.rule);

        this.props.formik.setFieldValue(this.props.treeId, modifiedRule);
    }

    private getNewRuleFromComparatorChange(newComparator: RuleComparator, prevRule: PlaylistRule): PlaylistRule {
        const modifiedRule: PlaylistRule = {
            ...prevRule,
            comparator: newComparator,
        };

        if (isYearRule(prevRule)) {
            if (newComparator === RuleComparator.Between && isYearIsRule(prevRule)) {
                modifiedRule.value = {
                    start: prevRule.value,
                    end: prevRule.value,
                };
            }
            if (newComparator === RuleComparator.Is && isYearBetweenRule(prevRule)) {
                modifiedRule.value = prevRule.value.start || prevRule.value.end;
            }
        }

        return modifiedRule;
    }
}
