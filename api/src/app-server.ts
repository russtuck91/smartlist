import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Request, Response, NextFunction, static as serveStatic } from 'express';
import httpContext from 'express-http-context';
import session from 'express-session';
import path from 'path';

import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';

import * as controllers from './controllers';
import { setSessionTokenContext } from './core/session/session-util';

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
            secret: process.env.client_secret || 'defaultSecret'
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
        const ctlrInstances: any[] = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                const controller = (controllers as any)[name];
                ctlrInstances.push(new controller());
            }
        }
        super.addControllers(ctlrInstances);
    }


    public start(port: number): void {
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