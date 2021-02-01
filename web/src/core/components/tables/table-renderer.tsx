import {
    Box, LabelDisplayedRowsArgs, 
    Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, 
    Theme, Typography, withStyles, WithStyles
} from '@material-ui/core';
import { get } from 'lodash';
import * as React from 'react';

import { ColumnSet, ColumnConfig, ColumnFormatType } from './models';
import { toDateTimeFormat } from '../../utils/date-util';

export interface TableRendererProps {
    data: any[];
    columns: ColumnSet;

    customCellFormatter?: (cellValue: any, column: ColumnConfig, columnIndex: number, rowData: any, rowIndex: number) => any;
    stickyHeader?: boolean;
    footerLabel?: React.ReactNode;
}

const useStyles = (theme: Theme) => ({
    footer: {
        '& .MuiTablePagination-toolbar': {
            paddingRight: theme.spacing(3),
            paddingTop: theme.spacing(0.75),
            paddingBottom: theme.spacing(0.75),
            minHeight: 0,
        },
        '& .MuiTableCell-footer': {
            position: 'sticky',
            bottom: 0,
            backgroundColor: theme.palette.background.default,

            '& .MuiTablePagination-actions': {
                display: 'none',
            }
        }
    }
});

type FullProps = TableRendererProps & WithStyles<typeof useStyles>;

export class RawTableRenderer extends React.Component<FullProps> {
    render() {
        return (
            <Table
                stickyHeader={this.props.stickyHeader}
                size="small"
            >
                {this.renderHead()}
                {this.renderBody()}
                {this.renderFooter()}
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
        const { data, columns } = this.props;

        return (
            <TableBody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length}>
                            <Box p={3}>
                                <Typography align="center">
                                    No records to display
                                </Typography>
                            </Box>
                        </td>
                    </tr>
                ) :
                    data.map(this.renderRow)
                }
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

        if (cellValue === null || cellValue === undefined) {
            return null;
        }

        if (column.type === ColumnFormatType.DateTime) {
            return toDateTimeFormat(cellValue);
        }

        return cellValue;
    }

    private renderFooter() {
        const { classes, data, footerLabel } = this.props;

        return (
            <TableFooter className={classes.footer}>
                <TableRow>
                    <TablePagination
                        count={data.length}
                        rowsPerPage={-1}
                        rowsPerPageOptions={[]}
                        page={0}
                        onChangePage={() => {}}
                        labelDisplayedRows={(paginationInfo: LabelDisplayedRowsArgs) => <>{paginationInfo.count} {footerLabel}</>}
                    />
                </TableRow>
            </TableFooter>
        );
    }
}

export const TableRenderer = withStyles(useStyles)(RawTableRenderer);
