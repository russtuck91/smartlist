import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as bodyParser from 'body-parser';
import connectMongo from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { NextFunction, Request, Response, static as serveStatic } from 'express';
import httpContext from 'express-http-context';
import session from 'express-session';
import sslRedirect from 'heroku-ssl-redirect';
import path from 'path';

import { MONGODB_URI } from './core/db/db';
import logger from './core/logger/logger';
import { setSessionTokenContext } from './core/session/session-util';

import { BaseController } from './base-controller';

const MongoStore = connectMongo(session);

process.on('unhandledRejection', (error: any, promise) => {
    logger.info('Unhandled Rejection at: Promise', promise);
    logger.error('Error:', error);
    console.dir(error.stack);
    // throw error;
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
        this.app.use(this.sslRedirectHandler);

        this.app.use(session({
            secret: process.env.client_secret || 'defaultSecret',
            store: new MongoStore({ url: MONGODB_URI }),
        }));

        this.setupControllers();

        // Error handling
        this.app.use(this.errorHandler);
    }

    private sslRedirectHandler(req: Request, res: Response, next: NextFunction) {
        if (['localhost', '10.0.2.2'].includes(req.hostname)) {
            return next();
        } else {
            return (sslRedirect())(req, res, next);
        }
    }

    private errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
        logger.debug('>>>> Entering errorHandler()');
        logger.error(error);

        res.sendStatus(error.statusCode);
    }

    private setupControllers(): void {
        super.addControllers(new BaseController());
    }


    public start(port: number|string): void {
        logger.info(`Starting application, environment: ${process.env.NODE_ENV}`);
        if (process.env.NODE_ENV === 'production') {
            this.app.use(serveStatic('../web/build/'));
            this.app.get('*', (req, res) => {
                res.sendFile(path.resolve('../web/build/index.html'));
            });
        }
        this.app.listen(port, () => {
            Logger.Imp(this.SERVER_STARTED + port);
        });
    }
}

export default AppServer;
