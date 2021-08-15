import {
    Box, LabelDisplayedRowsArgs,
    Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow,
    Theme, Typography, WithStyles, withStyles,
} from '@material-ui/core';
import * as React from 'react';

import { ColumnConfig, ColumnSet, CustomCellFormatter, ExpandableRowOptions } from './models';
import { RowRenderer } from './row-renderer';

export interface TableRendererProps {
    data: any[];
    columns: ColumnSet;

    customCellFormatter?: CustomCellFormatter;
    stickyHeader?: boolean;
    footerLabel?: React.ReactNode;
    expandableRows?: ExpandableRowOptions;
}

const useStyles = (theme: Theme) => ({
    expansionToggleColumn: {
        '&.MuiTableCell-root': {
            '&.MuiTableCell-root': {
                width: '3em',
            },
        },
    },
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
            },
        },
    },
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
        const { columns, expandableRows, classes } = this.props;

        return (
            <TableHead>
                <TableRow>
                    {columns.map(this.renderHeadColumn)}
                    {expandableRows && (
                        <TableCell className={classes.expansionToggleColumn} />
                    )}
                </TableRow>
            </TableHead>
        );
    }

    private renderHeadColumn(column: ColumnConfig, index: number) {
        return (
            <TableCell key={index} style={{ width: column.width }}>{column.title}</TableCell>
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
                    data.map(this.renderRow)}
            </TableBody>
        );
    }

    private renderRow = (datum: any, rowIndex: number) => {
        return (
            <RowRenderer
                key={rowIndex}
                row={datum}
                rowIndex={rowIndex}
                columns={this.props.columns}

                customCellFormatter={this.props.customCellFormatter}
                expandableRows={this.props.expandableRows}
            />
        );
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
                        labelDisplayedRows={(paginationInfo: LabelDisplayedRowsArgs) => (
                            <>
                                {paginationInfo.count}
                                {' '}
                                {footerLabel}
                            </>
                        )}
                    />
                </TableRow>
            </TableFooter>
        );
    }
}

export const TableRenderer = withStyles(useStyles)(RawTableRenderer);
