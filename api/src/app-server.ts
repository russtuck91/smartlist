import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Request, Response, NextFunction, static as serveStatic } from 'express';
import connectMongo from 'connect-mongo';
import httpContext from 'express-http-context';
import session from 'express-session';
import path from 'path';

import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';

import { MONGODB_URI } from './core/db/db';
import { setSessionTokenContext } from './core/session/session-util';
import { BaseController } from './base-controller';

const MongoStore = connectMongo(session);

process.on('unhandledRejection', (error: any, promise) => {
    console.log('Unhandled Rejection at: Promise', promise);
    console.log('Error:', error);
    console.dir(error.stack);
});

class AppServer extends Server {
    private readonly SERVER_STARTED = 'Example server started on port: ';

    constructor() {
        super(true);

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));

        this.app.use(cookieParser());
        this.app.use(cors());
        this.app.use(httpContext.middleware);
        this.app.use(setSessionTokenContext);

        this.app.use(session({
            secret: process.env.client_secret || 'defaultSecret',
            store: new MongoStore({ url: MONGODB_URI })
        }));

        this.setupControllers();

        // Error handling
        this.app.use(this.errorHandler);
    }

    private errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
        console.log('in errorHandler');
        console.log(error);

        res.sendStatus(error.statusCode);
    }

    private setupControllers(): void {
        super.addControllers(new BaseController());
    }


    public start(port: number|string): void {
        console.log('NODE_ENV', process.env.NODE_ENV);
        if (process.env.NODE_ENV === 'production') {
            this.app.use(serveStatic('../web/build/'));
            this.app.get('*', (req, res) => {
                res.sendFile(path.resolve('../web/build/index.html'));
            });
        } else {
            this.app.get('*', (req, res) => {
                res.send(this.SERVER_STARTED + port);
            });
        }
        this.app.listen(port, () => {
            Logger.Imp(this.SERVER_STARTED + port);
        });
    }
}

export default AppServer;