import { Grid, IconButton, ListItem, Theme, WithStyles, withStyles } from '@material-ui/core';
import { RemoveCircleOutline } from '@material-ui/icons';
import { FormikProps } from 'formik';
import * as React from 'react';

import { getComparatorsForParam, isGenreRule, isYearBetweenRule, isYearIsRule, isYearRule, PlaylistRule, RuleComparator, RuleParam } from '../../../../shared';
import { convertEnumToArray } from '../../../../shared/src/util/object-util';

import { CheckboxField, DropdownField, TextField } from '../../core/forms/fields';
import { YearPickerField } from '../../core/forms/fields/year-picker-field';

import { GenreRuleAutocompleteField } from './genre-rule-autocomplete-field';
import { getNewConditionByParam, PlaylistBuilderFormValues } from './models';
import { RuleAutocompleteField } from './rule-autocomplete-field';


const ruleParams = convertEnumToArray(RuleParam);

interface RuleFieldProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
    rule: PlaylistRule;
    treeId: string;
    removeCondition: () => void;
    divider: boolean;
}

const useStyles = (theme: Theme) => ({
    root: {
        '&:last-child': {
            borderBottom: 0,
        },
        [theme.breakpoints.down('xs')]: {
            paddingTop: theme.spacing(1.5),
            paddingBottom: theme.spacing(1.5),
        },
    },
    inputsContainer: {
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
        '& > .MuiGrid-item': {
            paddingBottom: 0,
            paddingTop: 0,
        },
    },
});

type FullProps = RuleFieldProps & WithStyles<typeof useStyles>;

export class RawRuleField extends React.Component<FullProps> {
    render() {
        const { rule, treeId, classes, divider } = this.props;

        const comparators = getComparatorsForParam(rule.param);

        return (
            <ListItem
                className={classes.root}
                divider={divider}
            >
                <Grid
                    container
                    wrap="nowrap"
                    alignItems="center"
                    spacing={2}
                    className="rule"
                >
                    <Grid item xs={12}>
                        <Grid
                            container
                            alignItems="center"
                            spacing={2}
                            wrap={rule.param === RuleParam.Saved ? 'nowrap' : undefined}
                            className={classes.inputsContainer}
                        >
                            <Grid item xs={6} sm={3}>
                                <DropdownField
                                    id={`${treeId}.param`}
                                    value={rule.param}
                                    options={ruleParams}
                                    onChange={this.onChangeRuleType}
                                />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <DropdownField
                                    id={`${treeId}.comparator`}
                                    value={rule.comparator || (comparators.length === 1 ? comparators[0] : rule.comparator)}
                                    options={comparators}
                                    disabled={comparators.length <= 1}
                                    onChange={this.onChangeComparator}
                                />
                            </Grid>
                            <Grid item xs={rule.param === RuleParam.Saved ? true : 12} sm={6}>
                                {this.renderRuleValueField()}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs>
                        <IconButton onClick={this.props.removeCondition}>
                            <RemoveCircleOutline color="error" fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            </ListItem>
        );
    }

    private renderBetweenValueFields() {
        const { rule, treeId } = this.props;

        return (
            <Grid container wrap="nowrap" alignItems="center" spacing={1}>
                <Grid item xs={6}>
                    {isYearBetweenRule(rule) ? (
                        <YearPickerField
                            id={`${treeId}.value.start`}
                            required
                            maxDate={rule.value.end}
                        />
                    ): (
                        <TextField
                            id={`${treeId}.value.start`}
                            required
                        />
                    )}
                </Grid>
                <Grid item>to</Grid>
                <Grid item xs={6}>
                    {isYearBetweenRule(rule) ? (
                        <YearPickerField
                            id={`${treeId}.value.end`}
                            required
                            minDate={rule.value.start}
                        />
                    ) : (
                        <TextField
                            id={`${treeId}.value.end`}
                            required
                        />
                    )}
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

        if (rule.comparator === RuleComparator.Between) {
            return this.renderBetweenValueFields();
        }

        if (isYearRule(rule)) {
            return (
                <YearPickerField
                    id={`${treeId}.value`}
                    required
                />
            );
        }

        if (
            rule.comparator === RuleComparator.Is &&
            rule.param !== RuleParam.Year
        ) {
            if (isGenreRule(rule)) {
                return (
                    <GenreRuleAutocompleteField
                        id={`${treeId}.value`}
                        rule={rule}
                    />
                );
            }
            return (
                <RuleAutocompleteField
                    id={`${treeId}.value`}
                    rule={rule}
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

export const RuleField = withStyles(useStyles)(RawRuleField);
