import { Pool } from 'workerpool';


export const execMock = jest.fn();

export const pool = jest.fn((): Partial<Pool> => ({
    exec: execMock,
    terminate: jest.fn(),
}));
