
export interface ColumnConfig<T = any> {
    title: string;
    mapsToField: keyof T|'';
    type?: ColumnFormatType;
}

export type ColumnSet<T = any> = ColumnConfig<T>[];


export enum ColumnFormatType {
    Actions = 'Actions'
}
