
export interface ColumnConfig<T = any> {
    title: string;
    mapsToField: keyof T|''|string;
    type?: ColumnFormatType;
    width?: string;
}

export type ColumnSet<T = any> = ColumnConfig<T>[];


export enum ColumnFormatType {
    Actions = 'Actions',
    DateTime = 'DateTime',
    Ellipsis = 'Ellipsis',
    TrackName = 'TrackName',
}


export type CustomCellFormatter = (props: CustomCellFormatterProps) => React.ReactNode;

export interface CustomCellFormatterProps<R = any> {
    cellValue: any;
    column: ColumnConfig;
    columnIndex: number;
    rowData: R;
    rowIndex: number;
    isLoading: boolean;
}


export interface ExpandableRowOptions {
    renderExpandedRow: (rowData: any) => React.ReactNode;
}

