import { Box, List, Paper } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { FormikProps } from 'formik';
import { clone } from 'lodash';
import React from 'react';

import { PlaylistRule } from '../../../../shared';

import IconButton from './icon-button';
import { DEFAULT_NEW_CONDITION, PlaylistBuilderFormValues } from './models';
import { RuleField } from './rule-field';


interface ExceptionListProps {
    formik: FormikProps<PlaylistBuilderFormValues>;
    exceptions: PlaylistRule[];
}

class ExceptionList extends React.Component<ExceptionListProps> {
    render() {
        const { exceptions } = this.props;
        return (
            <Paper elevation={5}>
                <Box py={1}>
                    <List disablePadding>
                        {exceptions.map(this.renderExceptRule)}
                        <Box key="buttons" display="flex" justifyContent="center">
                            <IconButton onClick={this.addException}>
                                <AddCircle />
                                {' '}
                                Exception
                            </IconButton>
                        </Box>
                    </List>
                </Box>
            </Paper>
        );
    }

    private renderExceptRule = (exception: PlaylistRule, index: number) => {
        const thisItemTreeId = `exceptions[${index}]`;
        return (
            <RuleField
                key={index}
                formik={this.props.formik}
                rule={exception}
                treeId={thisItemTreeId}
                removeCondition={() => this.removeException(index)}
                divider={index < this.props.exceptions.length - 1}
            />
        );
    };

    private addException = () => {
        const { formik: { values, setFieldValue } } = this.props;

        const newIndex = values.exceptions.length;
        const newException: PlaylistRule = DEFAULT_NEW_CONDITION;
        setFieldValue(`exceptions[${newIndex}]`, newException);
    };

    private removeException = (indexToRemove: number) => {
        const { exceptions, formik: { setFieldValue } } = this.props;

        const newExceptions = clone(exceptions);
        newExceptions.splice(indexToRemove, 1);
        setFieldValue('exceptions', newExceptions);
    };
}

export default ExceptionList;
