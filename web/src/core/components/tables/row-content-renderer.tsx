import { IconButton, StyleRules, TableCell, Theme, WithStyles, withStyles } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import classNames from 'classnames';
import { get } from 'lodash';
import React from 'react';

import { toDateTimeFormat } from '../../utils';

import Ellipsis from '../ellipsis';

import { ColumnConfig, ColumnFormatType, ColumnSet, CustomCellFormatter, ExpandableRowOptions } from './models';


interface RowContentRendererProps {
    row: any;
    rowIndex: number;
    columns: ColumnSet;

    isLoading: boolean;
    customCellFormatter?: CustomCellFormatter;
    expandableRows?: ExpandableRowOptions;
    onToggleExpanded: () => void;
}

const useStyles = (theme: Theme): StyleRules => ({
    hasExpandableRows: {
        borderBottom: 'unset',
    },
    expansionToggleLoading: {
        visibility: 'hidden',
    },
});

type FullProps = RowContentRendererProps & WithStyles<typeof useStyles>;

const RawRowContentRenderer: React.FC<FullProps> = ({
    classes,

    columns,
    row,
    rowIndex,

    isLoading,
    customCellFormatter,
    expandableRows,
    onToggleExpanded,
}) => {
    function cellFormatter(cellValue: any, column: ColumnConfig, columnIndex: number) {
        if (customCellFormatter) {
            const customFormatResult = customCellFormatter({
                cellValue,
                column,
                columnIndex,
                rowData: row,
                rowIndex,
                isLoading,
            });
            if (customFormatResult != null) {
                return customFormatResult;
            }
        }

        if (isLoading) {
            return <Skeleton />;
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

    function renderExpansionToggle() {
        if (!expandableRows) { return null; }

        return (
            <TableCell
                key="expansion-toggle"
                className={classNames({
                    [classes.hasExpandableRows]: expandableRows,
                    [classes.expansionToggleLoading]: isLoading,
                })}
            >
                <IconButton onClick={onToggleExpanded}>
                    <MoreVert />
                </IconButton>
            </TableCell>
        );
    }

    return (
        <>
            {columns.map((column, columnIndex) => {
                const cellValue = get(row, column.mapsToField);
                const formattedCellValue = cellFormatter(cellValue, column, columnIndex);
                return (
                    <TableCell
                        key={columnIndex}
                        className={classNames({
                            [classes.hasExpandableRows]: expandableRows,
                        })}
                    >
                        {formattedCellValue}
                    </TableCell>
                );
            })}
            {renderExpansionToggle()}
        </>
    );
};

export const RowContentRenderer = withStyles(useStyles)(RawRowContentRenderer);
