import { Collapse, TableCell, Theme, WithStyles, withStyles } from '@material-ui/core';
import React from 'react';

import { ExpandableRowOptions } from './models';


interface ExpansionRowContentRendererProps {
    row: any;
    expandableRows?: ExpandableRowOptions;
    expanded: boolean;
}

const useStyles = (theme: Theme) => ({
    expansionRowContent: {
        paddingTop: 0,
        paddingBottom: 0,
    },
});

type FullProps = ExpansionRowContentRendererProps & WithStyles<typeof useStyles>;

const RawExpansionRowContentRenderer: React.FC<FullProps> = ({
    row,
    expandableRows,
    expanded,
    classes,
}) => {
    if (!expandableRows) { return null; }

    return (
        <TableCell className={classes.expansionRowContent} colSpan={99}>
            <Collapse in={expanded} mountOnEnter>
                {expandableRows.renderExpandedRow(row)}
            </Collapse>
        </TableCell>
    );
};

export const ExpansionRowContentRenderer = withStyles(useStyles)(RawExpansionRowContentRenderer);
