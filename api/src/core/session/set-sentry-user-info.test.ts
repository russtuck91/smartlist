import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import { Unauthorized } from 'http-errors';

import getCurrentUser from '../../services/user-service/get-current-user';

import { userFactory } from '../test-data';

import setSentryUserInfo from './set-sentry-user-info';


jest.mock('../../services/user-service/get-current-user');

const mockedGetCurrentUser = jest.mocked(getCurrentUser);


describe('setSentryUserInfo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call Sentry with user details', async () => {
        // Arrange
        const user = userFactory.build();
        mockedGetCurrentUser.mockResolvedValue(user);

        // Act
        await setSentryUserInfo({} as Request, {} as Response, jest.fn());

        // Assert
        expect(Sentry.setUser).toHaveBeenCalledWith(expect.objectContaining({
            id: user.id,
            username: user.username,
        }));
    });

    it('should not call anything when user is Unauthorized', async () => {
        // Arrange
        mockedGetCurrentUser.mockImplementation(() => {
            throw new Unauthorized();
        });

        // Act
        await setSentryUserInfo({} as Request, {} as Response, jest.fn());

        // Assert
        expect(Sentry.setUser).not.toHaveBeenCalled();
    });
});
