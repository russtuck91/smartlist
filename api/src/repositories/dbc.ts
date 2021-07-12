import { DatabaseClient } from 'mongtype';

import { MONGODB_URI } from '../core/db/db';

const dbc = new DatabaseClient();
dbc.connect(MONGODB_URI);

export default dbc;
