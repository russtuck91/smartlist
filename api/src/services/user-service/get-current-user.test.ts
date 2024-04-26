import httpContext from 'express-http-context';
import { Unauthorized } from 'http-errors';

import { userFactory } from '../../core/test-data';

import userRepo from '../../repositories/user-repository';

import getCurrentUser from './get-current-user';


jest.mock('express-http-context');

const mockedGetSessionToken = jest.mocked(httpContext.get);
const mockedFind = jest.mocked(userRepo.findOne);


describe('getCurrentUser', () => {
    const user = userFactory.build();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get current user', async () => {
        // Arrange
        mockedGetSessionToken.mockReturnValue(user.sessionToken);
        mockedFind.mockResolvedValue(user);

        // Act
        const result = await getCurrentUser();

        // Assert
        expect(result).toBe(user);
    });

    it('should throw 401 if sessionToken not provided', async () => {
        // Arrange
        mockedGetSessionToken.mockReturnValue(undefined);
        mockedFind.mockResolvedValue(user);

        // Act & Assert
        await expect(getCurrentUser()).rejects.toThrowError(Unauthorized);
    });

    it('should throw 401 if non matching sessionToken provided', async () => {
        // Arrange
        mockedGetSessionToken.mockReturnValue('whateverJunkNonsense');
        mockedFind.mockResolvedValue(null);

        // Act & Assert
        await expect(getCurrentUser()).rejects.toThrowError(Unauthorized);
    });
});
