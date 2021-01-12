import { Grid, IconButton } from '@material-ui/core';
import { RemoveCircleOutline } from '@material-ui/icons';
import { FormikProps } from 'formik';
import * as React from 'react';

import { getComparatorsForParam, PlaylistRule, RuleComparator, RuleParam } from '../../../../shared';
import { convertEnumToArray } from '../../../../shared/src/util/object-util';

import { CheckboxField, DropdownField, TextField } from '../../core/forms/fields';
import { AutocompleteField } from '../../core/forms/fields/autocomplete-field';

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
}