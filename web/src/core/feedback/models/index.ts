
export interface FeedbackFormValues {
    email: string;
    type: FeedbackType;
    message: string;
}

export enum FeedbackType {
    General = 'General',
    Bug = 'Bug',
}
