import { DBObject } from '../../shared-models';

export interface User extends DBObject {
    username: string;
    accessToken: string;
    refreshToken: string;
}