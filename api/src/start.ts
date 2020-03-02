import AppServer from './app-server';
require('./agenda');

const appServer = new AppServer();
appServer.start(5000);