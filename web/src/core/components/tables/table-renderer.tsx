import { Table, TableHead, TableRow, TableBody, TableCell } from '@material-ui/core';
import { get } from 'lodash';
import * as React from 'react';

import { ColumnSet, ColumnConfig } from './models';

export interface TableRendererProps {
    data: any[];
    columns: ColumnSet;

    customCellFormatter?: (cellValue: any, column: ColumnConfig, columnIndex: number, rowData: any, rowIndex: number) => any;
}

export class TableRenderer extends React.Component<TableRendererProps> {
    render() {
        return (
            <Table>
                {this.renderHead()}
                {this.renderBody()}
            </Table>
        );
    }

    private renderHead() {
        const { columns } = this.props;

        return (
            <TableHead>
                <TableRow>
                    {columns.map(this.renderHeadColumn)}
                </TableRow>
            </TableHead>
        );
    }

    private renderHeadColumn(column: ColumnConfig, index: number) {
        return (
            <TableCell key={index}>{column.title}</TableCell>
        );
    }

    private renderBody() {
        const { data } = this.props;

        return (
            <TableBody>
                {data.map(this.renderRow)}
            </TableBody>
        );
    }

    private renderRow = (datum: any, rowIndex: number) => {
        const { columns } = this.props;

        return (
            <TableRow key={rowIndex}>
                {columns.map((column, columnIndex) => {
                    const cellValue = get(datum, column.mapsToField);
                    const formattedCellValue = this.cellFormatter(cellValue, column, columnIndex, datum, rowIndex);
                    return (
                        <TableCell key={columnIndex}>{formattedCellValue}</TableCell>
                    );
                })}
            </TableRow>
        );
    }

    private cellFormatter(cellValue: any, column: ColumnConfig, columnIndex: number, rowData: any, rowIndex: number) {
        const { customCellFormatter } = this.props;

        if (customCellFormatter) {
            const customFormatResult = customCellFormatter(cellValue, column, columnIndex, rowData, rowIndex);
            if (customFormatResult != null) {
                return customFormatResult;
            }
        }

        return cellValue;
    }
}