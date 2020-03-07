import moment from 'moment';


export const DATE_TIME_FORMAT = 'l LT';

export function toDateTimeFormat(value: string) {
    return moment(value).format(DATE_TIME_FORMAT);
}

