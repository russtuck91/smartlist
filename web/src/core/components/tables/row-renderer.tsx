import { TableRow, Theme, WithStyles, withStyles } from '@material-ui/core';
import React from 'react';

import { ExpansionRowContentRenderer } from './expansion-row-content-renderer';
import { ColumnSet, CustomCellFormatter, ExpandableRowOptions } from './models';
import { RowContentRenderer } from './row-content-renderer';


interface RowRendererProps {
    row: any;
    rowIndex: number;
    columns: ColumnSet;

    isLoading: boolean;
    customCellFormatter?: CustomCellFormatter;
    expandableRows?: ExpandableRowOptions;
}

interface RowRendererState {
    expanded: boolean;
}

const useStyles = (theme: Theme) => ({
});

type FullProps = RowRendererProps & WithStyles<typeof useStyles>;

export class RawRowRenderer extends React.Component<FullProps, RowRendererState> {
    state = {
        expanded: false,
    };

    render() {
        return (
            <>
                <TableRow>
                    <RowContentRenderer
                        {...this.props}
                        onToggleExpanded={this.handleToggleExpanded}
                    />
                </TableRow>
                {this.renderExpansionRow()}
            </>
        );
    }

    private renderExpansionRow() {
        if (!this.props.expandableRows) { return null; }

        return (
            <TableRow>
                <ExpansionRowContentRenderer
                    row={this.props.row}
                    expandableRows={this.props.expandableRows}
                    expanded={this.state.expanded}
                />
            </TableRow>
        );
    }

    private handleToggleExpanded = () => {
        this.setState((prevState) => ({
            expanded: !prevState.expanded,
        }));
    }
}

export const RowRenderer = withStyles(useStyles)(RawRowRenderer);
