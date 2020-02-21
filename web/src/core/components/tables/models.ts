
export interface ColumnConfig {
    title: string;
    mapsToField: string;
    type?: ColumnFormatType;
}

export type ColumnSet = ColumnConfig[];


export enum ColumnFormatType {
    Actions = 'Actions'
}
