import winston from 'winston';

import { baseRequestUrl, requests } from '../requests/requests';

export default async function(info: winston.LogEntry) {
    // console.log(`>>> Entering logToPersistent(info.level = ${info.level}, info.message = ${info.message}`);
    // console.log(info);
    await requests.post(`${baseRequestUrl}/logger`, info);
}
