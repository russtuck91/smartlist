import { Controller, ChildControllers } from '@overnightjs/core';

import * as controllers from './controllers';


function getAllControllers() {
    const ctlrInstances: any[] = [];
    for (const name in controllers) {
        if (controllers.hasOwnProperty(name)) {
            const controller = (controllers as any)[name];
            ctlrInstances.push(new controller());
        }
    }
    return ctlrInstances;
}

@Controller('api')
@ChildControllers(getAllControllers())
export class BaseController {

}
