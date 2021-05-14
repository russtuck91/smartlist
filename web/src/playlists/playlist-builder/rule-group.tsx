import { Box, Button, ButtonGroup, Grid, List, ListItem, Paper, StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import classNames from 'classnames';
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

const useStyles = (theme: Theme): StyleRules => ({
    root: {
        flexGrow: 1,
        padding: theme.spacing(1),
    },
    paper: {
        flexGrow: 1,
        overflow: 'hidden',
        paddingBottom: theme.spacing(1),
    },
    header: {
        fontWeight: 'bold',
        backgroundColor: '#172545',

        '& .MuiButton-root': {
            '&.MuiButton-contained': {
                fontWeight: 'inherit',
                paddingLeft: theme.spacing(3),
                paddingRight: theme.spacing(3),
            },
        },
    },
    andGroupHeader: {
        backgroundColor: '#451717',
    },
    groupLabel: {
        letterSpacing: 1,
    },
    buttonGroup: {
        '& .MuiButton-root': {
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),

            '& .MuiSvgIcon-root': {
                fontSize: '1rem',
                marginRight: theme.spacing(1),
                marginTop: -2,
            },
        },
    },
});

type FullProps = RuleGroupProps & WithStyles<typeof useStyles>;

export class RawRuleGroup extends React.Component<FullProps> {
    render() {
        const { ruleGroup } = this.props;

        return (
            <ListItem className={this.props.classes.root}>
                <Paper className={this.props.classes.paper} elevation={5}>
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            {this.renderHeader()}
                        </Grid>
                        <Box flex="1 1 auto">
                            <List disablePadding>
                                {ruleGroup.rules.map((rule, index) => {
                                    if (isPlaylistRuleGroup(rule)) {
                                        return this.renderRuleGroup(rule, index);
                                    } else {
                                        const nextRule = ruleGroup.rules[index + 1];
                                        const isNextRuleARule = nextRule && !isPlaylistRuleGroup(nextRule);
                                        return (
                                            <>
                                                {this.renderRuleField(rule, index, isNextRuleARule)}
                                                {(!isNextRuleARule) && (
                                                    <Box key="buttons" display="flex" justifyContent="center">
                                                        {this.renderButtons()}
                                                    </Box>
                                                )}
                                            </>
                                        );
                                    }
                                })}
                            </List>
                        </Box>
                    </Grid>
                </Paper>
            </ListItem>
        );
    }

    private renderHeader() {
        const { ruleGroup, treeId, formik: { setFieldValue }, classes } = this.props;
        return (
            <Box
                p={0.75}
                className={classNames(classes.header, {
                    [classes.andGroupHeader]: ruleGroup.type === RuleGroupType.And,
                })}
            >
                <Grid container wrap="nowrap" alignItems="baseline" spacing={2}>
                    <Grid item>
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
                    <Grid item className={classes.groupLabel}>
                        GROUP
                    </Grid>
                </Grid>
            </Box>
        );
    }

    private renderButtons() {
        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Button
                    variant="outlined"
                    onClick={this.addCondition}
                >
                    <AddCircle />
                    {' '}
                    rule
                </Button>
                <Button
                    variant="outlined"
                    onClick={this.addGroup}
                >
                    <AddCircle />
                    {' '}
                    group
                </Button>
            </ButtonGroup>
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

    private renderRuleField(rule: PlaylistRule, index: number, divider: boolean) {
        return (
            <RuleField
                key={index}
                formik={this.props.formik}
                rule={rule}
                treeId={this.getChildRuleTreeId(index)}
                removeCondition={() => this.removeCondition(index)}
                divider={divider}
            />
        );
    }

    private getChildRuleTreeId(index: number) {
        return `${this.props.treeId}.rules[${index}]`;
    }

    private addCondition = () => {
        const { treeId, ruleGroup, formik: { setFieldValue } } = this.props;

        const insertAtIndex = ruleGroup.rules.reduce((agg, curr, index) => (
            !isPlaylistRuleGroup(curr) ? index : agg
        ), -1) + 1;
        ruleGroup.rules.splice(insertAtIndex, 0, DEFAULT_NEW_CONDITION);
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

export const RuleGroup = withStyles(useStyles)(RawRuleGroup);
