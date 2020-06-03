require('dotenv').config();

import AppServer from './app-server';
require('./agenda');

const appServer = new AppServer();

const PORT = process.env.PORT || 5000;
appServer.start(PORT);