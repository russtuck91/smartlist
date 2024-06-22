require('dotenv').config();

import AppServer from './app-server';

const agenda = require('./agenda');
agenda.startAgenda();

const appServer = new AppServer();

const PORT = process.env.PORT || 5000;
appServer.start(PORT);
