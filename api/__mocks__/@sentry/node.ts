import { Transaction } from '@sentry/node';


export const startTransaction = jest.fn((): Partial<Transaction> => ({
    finish: jest.fn(),
}));

export const setUser = jest.fn();
