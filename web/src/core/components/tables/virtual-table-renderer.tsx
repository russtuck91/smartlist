import {
    Box, LabelDisplayedRowsArgs,
    Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow,
    Theme, Typography, WithStyles, withStyles,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import classNames from 'classnames';
import { cloneDeep } from 'lodash';
import React, { ComponentPropsWithRef } from 'react';
import { ItemProps, ListProps, TableProps, TableVirtuoso } from 'react-virtuoso';

import { ExpansionRowContentRenderer } from './expansion-row-content-renderer';
import {
    ColumnConfig, ColumnSet, CustomCellFormatter, ExpandableRowOptions, FooterLabelRenderer,
} from './models';
import { RowContentRenderer } from './row-content-renderer';


export interface VirtualTableRendererProps {
    data: any[];
    columns: ColumnSet;

    isLoading?: boolean;
    customCellFormatter?: CustomCellFormatter;
    footerLabel?: FooterLabelRenderer;
    expandableRows?: ExpandableRowOptions;
}

interface VirtualTableRendererState {
    rowsExpanded: Record<string, boolean>;
}

const useStyles = (theme: Theme) => ({
    virtuosoBase: {
        '& .MuiTable-root': {
            borderCollapse: 'separate',
        },
    },
    virtuosoBaseLoading: {
        '& > div[style]': {
            overflow: 'hidden',
        },
    },
    expansionToggleColumn: {
        '&.MuiTableCell-root': {
            '&.MuiTableCell-root': {
                width: '3em',
            },
        },
    },
    footerContent: {
        '& .MuiTablePagination-toolbar': {
            paddingRight: theme.spacing(3),
            paddingTop: theme.spacing(0.75),
            paddingBottom: theme.spacing(0.75),
            minHeight: 0,
        },
        '& .MuiTableCell-footer': {
            backgroundColor: theme.palette.background.default,

            '& .MuiTablePagination-actions': {
                display: 'none',
            },
        },
    },
});

type FullProps = VirtualTableRendererProps & WithStyles<typeof useStyles>;

export class RawVirtualTableRenderer extends React.Component<FullProps, VirtualTableRendererState> {
    state = {
        rowsExpanded: {},
    };

    render() {
        return (
            <Box display="flex" flex="1 1 auto" flexDirection="column">
                <TableVirtuoso
                    key={`table-${this.props.isLoading ? 'loading' : 'loaded'}`}
                    className={classNames(this.props.classes.virtuosoBase, {
                        [this.props.classes.virtuosoBaseLoading]: this.props.isLoading,
                    })}
                    data={this.getData()}
                    components={{
                        Table: this.renderTableComponent,
                        TableHead: this.renderHeaderComponent,
                        TableFoot: this.renderFooterComponent,
                        TableBody: this.renderTableBodyComponent,
                        TableRow: this.renderTableRowComponent,
                        EmptyPlaceholder: this.renderEmptyPlaceholder,
                    }}
                    fixedHeaderContent={this.renderFixedHeaderContent}
                    fixedFooterContent={this.renderFooterContent}
                    itemContent={this.renderItemContent}
                    increaseViewportBy={{
                        top: 10000,
                        bottom: 2000,
                    }}
                />
            </Box>
        );
    }

    private getData() {
        if (this.props.isLoading) {
            // Create dummy rows to display Skeleton components
            return Array(100).fill({});
        }
        const result: any[] = this.props.data.reduce((agg, item) => {
            agg.push(item);
            if (this.props.expandableRows) {
                agg.push({ ...item, isExpansionRow: true });
            }
            return agg;
        }, []);
        return result;
    }

    private renderTableComponent(props: TableProps) {
        return <Table {...props} size="small" />;
    }

    private renderHeaderComponent = React.forwardRef(
        function TableHeaderComponent(props: ComponentPropsWithRef<'thead'>, ref: React.Ref<HTMLTableSectionElement>) {
            return <TableHead {...props} ref={ref} />;
        },
    );

    private renderFooterComponent = React.forwardRef<HTMLTableSectionElement>(
        function TableFooterComponent(props: ComponentPropsWithRef<'tfoot'>, ref: React.Ref<HTMLTableSectionElement>) {
            return <TableFooter {...props} ref={ref} />;
        },
    );

    private renderTableBodyComponent = React.forwardRef<HTMLTableSectionElement>(
        function TableBodyComponent(props: ListProps, ref: React.Ref<HTMLDivElement>){
            return <TableBody {...props} ref={ref} />;
        },
    );

    private renderTableRowComponent(props: ItemProps) {
        return <TableRow {...props} />;
    }

    private renderEmptyPlaceholder() {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={99}>
                        <Box p={3}>
                            <Typography align="center">
                                No records to display
                            </Typography>
                        </Box>
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    private renderFixedHeaderContent = () => {
        const { columns, expandableRows, classes } = this.props;

        return (
            <TableRow>
                {columns.map(this.renderHeadColumn)}
                {expandableRows && (
                    <TableCell className={classes.expansionToggleColumn} />
                )}
            </TableRow>
        );
    };

    private renderHeadColumn = (column: ColumnConfig, index: number) => {
        return (
            <TableCell key={index} style={{ width: column.width }}>
                {this.props.isLoading ? (
                    <Skeleton />
                ) : (
                    column.title
                )}
            </TableCell>
        );
    };

    private renderItemContent = (index: number, datum: any) => {
        if (datum.isExpansionRow) {
            return (
                <ExpansionRowContentRenderer
                    key={index}
                    row={datum}
                    expandableRows={this.props.expandableRows}
                    expanded={this.state.rowsExpanded[datum.id]}
                />
            );
        }
        return (
            <RowContentRenderer
                key={index}
                row={datum}
                rowIndex={index}
                columns={this.props.columns}

                isLoading={!!this.props.isLoading}
                customCellFormatter={this.props.customCellFormatter}
                expandableRows={this.props.expandableRows}
                onToggleExpanded={() => this.handleToggleRowExpansion(index, datum)}
            />
        );
    };

    private renderFooterContent = () => {
        const { classes, data, footerLabel } = this.props;

        const count = data.length;
        return (
            <TableRow className={classes.footerContent}>
                <TablePagination
                    count={count}
                    rowsPerPage={-1}
                    rowsPerPageOptions={[]}
                    page={0}
                    onChangePage={() => {}}
                    labelDisplayedRows={(paginationInfo: LabelDisplayedRowsArgs) => {
                        if (this.props.isLoading) {
                            return <Skeleton width="5em" />;
                        }
                        return (
                            <>
                                {paginationInfo.count}
                                {' '}
                                {footerLabel?.({ count })}
                            </>
                        );
                    }}
                />
            </TableRow>
        );
    };

    private handleToggleRowExpansion = (rowIndex: number, datum: any) => {
        this.setState((prevState) => {
            const newRowsExpanded = cloneDeep(prevState.rowsExpanded);
            newRowsExpanded[datum.id] = !prevState.rowsExpanded[datum.id];
            return {
                rowsExpanded: newRowsExpanded,
            };
        });
    };
}

export const VirtualTableRenderer = withStyles(useStyles)(RawVirtualTableRenderer);
