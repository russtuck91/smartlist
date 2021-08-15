import { Collapse, IconButton, TableCell, TableRow, Theme, WithStyles, withStyles } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import classNames from 'classnames';
import { get } from 'lodash';
import React from 'react';

import { toDateTimeFormat } from '../../utils';

import Ellipsis from '../ellipsis';

import { ColumnConfig, ColumnFormatType, ColumnSet, CustomCellFormatter, ExpandableRowOptions } from './models';


interface RowRendererProps {
    row: any;
    rowIndex: number;
    columns: ColumnSet;

    customCellFormatter?: CustomCellFormatter;
    expandableRows?: ExpandableRowOptions;
}

interface RowRendererState {
    expanded: boolean;
}

const useStyles = (theme: Theme) => ({
    hasExpandableRows: {
        '& > .MuiTableCell-root': {
            borderBottom: 'unset',
        },
    },
    expansionRow: {
        '& > .MuiTableCell-root': {
            paddingTop: 0,
            paddingBottom: 0,
        },
    },
});

type FullProps = RowRendererProps & WithStyles<typeof useStyles>;

export class RawRowRenderer extends React.Component<FullProps, RowRendererState> {
    state = {
        expanded: false,
    };

    render() {
        const { row, columns, expandableRows, classes } = this.props;

        return (
            <>
                <TableRow
                    className={classNames({
                        [classes.hasExpandableRows]: expandableRows,
                    })}
                >
                    {columns.map((column, columnIndex) => {
                        const cellValue = get(row, column.mapsToField);
                        const formattedCellValue = this.cellFormatter(cellValue, column, columnIndex);
                        return (
                            <TableCell key={columnIndex}>{formattedCellValue}</TableCell>
                        );
                    })}
                    {this.renderExpansionToggle()}
                </TableRow>
                {this.renderExpansionRow()}
            </>
        );
    }

    private cellFormatter(cellValue: any, column: ColumnConfig, columnIndex: number) {
        const { row, rowIndex, customCellFormatter } = this.props;

        if (customCellFormatter) {
            const customFormatResult = customCellFormatter(cellValue, column, columnIndex, row, rowIndex);
            if (customFormatResult != null) {
                return customFormatResult;
            }
        }

        if (cellValue === null || cellValue === undefined) {
            return null;
        }

        if (column.type === ColumnFormatType.DateTime) {
            return toDateTimeFormat(cellValue);
        }
        if (column.type === ColumnFormatType.Ellipsis) {
            return <Ellipsis>{cellValue}</Ellipsis>;
        }

        return cellValue;
    }

    private renderExpansionToggle() {
        const { expandableRows } = this.props;

        if (!expandableRows) { return null; }

        return (
            <TableCell>
                <IconButton onClick={this.toggleExpanded}>
                    <MoreVert />
                </IconButton>
            </TableCell>
        );
    }

    private renderExpansionRow() {
        const { row, expandableRows, classes } = this.props;
        const { expanded } = this.state;

        if (!expandableRows) { return null; }

        return (
            <TableRow className={classes.expansionRow}>
                <TableCell colSpan={99}>
                    <Collapse in={expanded} mountOnEnter>
                        {expandableRows.renderExpandedRow(row)}
                    </Collapse>
                </TableCell>
            </TableRow>
        );
    }

    private toggleExpanded = () => {
        this.setState((prevState) => ({
            expanded: !prevState.expanded,
        }));
    }
}

export const RowRenderer = withStyles(useStyles)(RawRowRenderer);
