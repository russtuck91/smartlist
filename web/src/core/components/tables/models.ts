
export interface ColumnConfig<T = any> {
    title: string;
    mapsToField: keyof T|''|string;
    type?: ColumnFormatType;
}

export type ColumnSet<T = any> = ColumnConfig<T>[];


export enum ColumnFormatType {
    Actions = 'Actions',
    DateTime = 'DateTime',
    Ellipsis = 'Ellipsis',
    TrackName = 'TrackName',
}


export type CustomCellFormatter = (cellValue: any, column: ColumnConfig, columnIndex: number, rowData: any, rowIndex: number) => any;


export interface ExpandableRowOptions {
    renderExpandedRow: (rowData: any) => React.ReactNode;
}

