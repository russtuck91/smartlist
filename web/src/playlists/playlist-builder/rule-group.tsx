import { Box, Button, ButtonGroup, Grid, List, ListItem, Paper, Theme, WithStyles, withStyles } from '@material-ui/core';
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

const useStyles = (theme: Theme) => ({
    root: {
        flexGrow: 1,
        padding: theme.spacing(1),
    },
    paper: {
        flexGrow: 1,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#172545',
        '& .MuiButton-sizeSmall': {
            [theme.breakpoints.down('xs')]: {
                paddingLeft: theme.spacing(0.75),
                paddingRight: theme.spacing(0.75),
            },
            '& .MuiSvgIcon-root': {
                fontSize: '1rem',
                marginRight: theme.spacing(0.5),
                marginTop: -2,
            },
        },
    },
    andGroupHeader: {
        backgroundColor: '#451717',
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
                                        const isNextRuleGroup = nextRule && isPlaylistRuleGroup(nextRule);
                                        return this.renderRuleField(rule, index, isNextRuleGroup);
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
        const { ruleGroup, treeId, formik: { setFieldValue } } = this.props;
        return (
            <Box
                p={0.75}
                className={classNames(this.props.classes.header, {
                    [this.props.classes.andGroupHeader]: ruleGroup.type === RuleGroupType.And,
                })}
            >
                <Grid container justify="space-between" wrap="nowrap">
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
                                <AddCircle />
                                {' '}
                                condition
                            </Button>
                            <Button
                                variant="contained"
                                onClick={this.addGroup}
                                size="small"
                            >
                                <AddCircle />
                                {' '}
                                group
                            </Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
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

    private renderRuleField(rule: PlaylistRule, index: number, isNextRuleGroup: boolean) {
        return (
            <RuleField
                key={index}
                formik={this.props.formik}
                rule={rule}
                treeId={this.getChildRuleTreeId(index)}
                removeCondition={() => this.removeCondition(index)}
                isNextRuleGroup={isNextRuleGroup}
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
