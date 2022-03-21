import { Box, Button, ButtonGroup, Grid, List, ListItem, Paper, StyleRules, Theme, WithStyles, withStyles } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import classNames from 'classnames';
import { FormikProps } from 'formik';
import { clone, get } from 'lodash';
import * as React from 'react';

import { isPlaylistRuleGroup, PlaylistRule, PlaylistRuleGroup, RuleGroupType } from '../../../../shared';
import { convertEnumToArray } from '../../../../shared/src/util/object-util';

import IconButton from './icon-button';
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
        backgroundColor: theme.colors.orGroupBlue,

        '& .MuiButton-root': {
            '&.MuiButton-contained': {
                fontWeight: 'inherit',
                paddingLeft: theme.spacing(3),
                paddingRight: theme.spacing(3),
            },
        },
    },
    andGroupHeader: {
        backgroundColor: theme.colors.andGroupRed,
    },
    groupLabel: {
        letterSpacing: 1,
    },
    buttonContainer: {
        '&:first-child': {
            paddingTop: theme.spacing(1),
        },
    },
});

type FullProps = RuleGroupProps & WithStyles<typeof useStyles>;

export class RawRuleGroup extends React.Component<FullProps> {
    componentDidUpdate(prevProps: FullProps) {
        // If rule group becomes empty, remove it
        if (this.props.ruleGroup.rules.length === 0 && prevProps.ruleGroup.rules.length > 0) {
            this.removeThisRuleGroup();
        }
    }

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
                                        return (
                                            <React.Fragment key={index}>
                                                {index === 0 && this.renderButtons()}
                                                {this.renderRuleGroup(rule, index)}
                                            </React.Fragment>
                                        );
                                    } else {
                                        const nextRule = ruleGroup.rules[index + 1];
                                        const isNextRuleARule = nextRule && !isPlaylistRuleGroup(nextRule);
                                        return (
                                            <React.Fragment key={index}>
                                                {this.renderRuleField(rule, index, isNextRuleARule)}
                                                {!isNextRuleARule && this.renderButtons()}
                                            </React.Fragment>
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
            <Box key="buttons" display="flex" justifyContent="center" className={this.props.classes.buttonContainer}>
                <ButtonGroup>
                    <IconButton onClick={this.addCondition}>
                        <AddCircle />
                        {' '}
                        rule
                    </IconButton>
                    <IconButton onClick={this.addGroup}>
                        <AddCircle />
                        {' '}
                        group
                    </IconButton>
                </ButtonGroup>
            </Box>
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

        const newRules = clone(ruleGroup.rules);
        const insertAtIndex = newRules.reduce((agg, curr, index) => (
            !isPlaylistRuleGroup(curr) ? index : agg
        ), -1) + 1;
        newRules.splice(insertAtIndex, 0, DEFAULT_NEW_CONDITION);
        setFieldValue(`${treeId}.rules`, newRules);
    };

    private addGroup = () => {
        const { treeId, ruleGroup, formik: { setFieldValue } } = this.props;

        const newRules = clone(ruleGroup.rules);
        const firstRuleGroup = newRules.findIndex((r) => isPlaylistRuleGroup(r));
        const insertLoc = firstRuleGroup === -1 ? newRules.length : firstRuleGroup;
        newRules.splice(insertLoc, 0, { type: RuleGroupType.And, rules: [ DEFAULT_NEW_CONDITION ] });
        setFieldValue(`${treeId}.rules`, newRules);
    };

    private removeCondition(indexToRemove: number) {
        const { ruleGroup, treeId, formik: { setFieldValue } } = this.props;

        const newRules = clone(ruleGroup.rules);
        newRules.splice(indexToRemove, 1);
        setFieldValue(`${treeId}.rules`, newRules);
    }

    private removeThisRuleGroup() {
        const { treeId, formik: { values, setFieldValue } } = this.props;

        const treeIdParts = treeId.split(/\[(\d+)\]$/);

        const containingListId = treeIdParts[0];
        const ruleGroupIndex = parseInt(treeIdParts[1]);

        const newContainingListVal = get(values, containingListId);
        newContainingListVal.splice(ruleGroupIndex, 1);
        setFieldValue(containingListId, newContainingListVal);
    }
}

export const RuleGroup = withStyles(useStyles)(RawRuleGroup);
