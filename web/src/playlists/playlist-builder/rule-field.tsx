import { Box, Grid, IconButton, ListItem, StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import { Info, RemoveCircleOutline } from '@material-ui/icons';
import classNames from 'classnames';
import { FormikProps } from 'formik';
import * as React from 'react';

import {
    getComparatorsForParam,
    isGenreRule, isInstrumentalRule, isSavedRule, isTempoRule, isYearBetweenRule, isYearIsRule, isYearRule,
    PlaylistRule, RuleComparator, RuleParam,
} from '../../../../shared';
import { convertEnumToArray } from '../../../../shared/src/util/object-util';

import SmTooltip from '../../core/components/tooltips/sm-tooltip';
import {
    CheckboxField, CustomOptionRendererProps, DefaultRangeField, DropdownField, TextField,
    YearPickerField, YearRangeField,
} from '../../core/forms/fields';

import { GenreRuleAutocompleteField } from './genre-rule-autocomplete-field';
import { getNewConditionByParam, PlaylistBuilderFormValues, ruleParamHelperText } from './models';
import { RuleAutocompleteField } from './rule-autocomplete-field';


const ruleParams = convertEnumToArray(RuleParam);

interface RuleFieldProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
    rule: PlaylistRule;
    treeId: string;
    removeCondition: () => void;
    divider: boolean;
}

const useStyles = (theme: Theme): StyleRules => ({
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
        '& .MuiCheckbox-root.MuiIconButton-root': {
            marginTop: theme.spacing(-1),
            marginBottom: theme.spacing(-1),
        },
    },
    inputsContainerOneLine: {
        flexWrap: 'nowrap',
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
                            spacing={2}
                            className={classNames(classes.inputsContainer, {
                                [classes.inputsContainerOneLine]: this.isOneLineRule(rule),
                            })}
                        >
                            <Grid item xs={6} sm="auto">
                                <DropdownField
                                    id={`${treeId}.param`}
                                    value={rule.param}
                                    options={ruleParams}
                                    onChange={this.onChangeRuleType}
                                    customOptionRenderer={this.ruleParamRenderer}
                                />
                            </Grid>
                            <Grid item xs={6} sm="auto">
                                <DropdownField
                                    id={`${treeId}.comparator`}
                                    value={rule.comparator || (comparators.length === 1 ? comparators[0] : rule.comparator)}
                                    options={comparators}
                                    disabled={comparators.length <= 1}
                                    onChange={this.onChangeComparator}
                                />
                            </Grid>
                            <Grid item xs={this.isOneLineRule(rule) ? true : 12} sm={true} style={{ alignSelf: 'center' }}>
                                {this.renderRuleValueField()}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs>
                        <IconButton onClick={this.props.removeCondition} size="small">
                            <RemoveCircleOutline color="error" fontSize="small" />
                        </IconButton>
                    </Grid>
                </Grid>
            </ListItem>
        );
    }

    private isOneLineRule(rule: PlaylistRule) {
        return isSavedRule(rule) || isInstrumentalRule(rule);
    }

    private ruleParamRenderer({ option }: CustomOptionRendererProps) {
        const helperText = ruleParamHelperText.get(option);
        return (
            <Grid container alignItems="center" wrap="nowrap">
                <Grid item xs>
                    {option}
                </Grid>
                <Grid item>
                    {helperText && (
                        <Box pl={0.5}>
                            <SmTooltip title={helperText}>
                                <Info fontSize="small" />
                            </SmTooltip>
                        </Box>
                    )}
                </Grid>
            </Grid>
        );
    }

    private renderBetweenValueFields() {
        const { rule, treeId } = this.props;

        if (isYearBetweenRule(rule)) {
            return (
                <YearRangeField
                    id={`${treeId}.value`}
                    value={rule.value}
                />
            );
        }

        return (
            <DefaultRangeField
                id={`${treeId}.value`}
            />
        );
    }

    private renderRuleValueField() {
        const { rule, treeId } = this.props;

        if (isSavedRule(rule) || isInstrumentalRule(rule)) {
            return (
                <CheckboxField
                    id={`${treeId}.value`}
                    value={Boolean(rule.value)}
                    disabled={isSavedRule(rule)}
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
        if (value === this.props.rule.param) {
            return;
        }
        const newCondition = getNewConditionByParam(value);

        this.props.formik.setFieldValue(this.props.treeId, newCondition);
        this.props.formik.setFieldTouched(`${this.props.treeId}.value`, false);
    };

    private onChangeComparator = (e: React.ChangeEvent<any>) => {
        const value: RuleComparator = e.target.value;
        const modifiedRule: PlaylistRule = this.getNewRuleFromComparatorChange(value, this.props.rule);

        this.props.formik.setFieldValue(this.props.treeId, modifiedRule);
    };

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

        if (isTempoRule(modifiedRule) && !isTempoRule(prevRule)) {
            modifiedRule.value = {
                start: '',
                end: '',
            };
        }

        return modifiedRule;
    }
}

export const RuleField = withStyles(useStyles)(RawRuleField);
