import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import httpContext from 'express-http-context';

import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';

import * as controllers from './controllers';

class AppServer extends Server {
    private readonly SERVER_STARTED = 'Example server started on port: ';

    constructor() {
        super(true);

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));

        this.app.use(cookieParser());
        this.app.use(cors());
        this.app.use(httpContext.middleware);

        this.setupControllers();
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
        this.app.get('*', (req, res) => {
            res.send(this.SERVER_STARTED + port);
        });
        this.app.listen(port, () => {
            Logger.Imp(this.SERVER_STARTED + port);
        });
    }
}

export default AppServer;