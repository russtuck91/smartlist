import userRepo from '../../repositories/user-repository';

import updateUser from './update-user';


const mockedUpdate = jest.mocked(userRepo.findOneAndUpdate);


describe('updateUser', () => {
    const testUsername = 'testUsername';
    const userUpdate = { accessToken: 'testAccessToken' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should make updates and not push to sessionToken when not specified', async () => {
        // Act
        await updateUser(testUsername, userUpdate);

        // Assert
        const updateRequestCall = mockedUpdate.mock.calls[0];
        const updateRequestArg = updateRequestCall[0];
        expect(updateRequestArg.conditions).toEqual({ username: testUsername });
        expect(updateRequestArg.updates.$set).toEqual({ ...userUpdate });
        expect(updateRequestArg.updates.$push).not.toHaveProperty('sessionToken');
        expect(updateRequestArg.updates.$push).toEqual({});
        expect(updateRequestArg.upsert).toBe(true);

    });

    it('should push sessionToken when specified', async () => {
        // Arrange
        const testSessionToken = 'testSessionToken';

        // Act
        await updateUser(testUsername, userUpdate, testSessionToken);

        // Assert
        const updateRequestCall = mockedUpdate.mock.calls[0];
        const updateRequestArg = updateRequestCall[0];
        expect(updateRequestArg.conditions).toEqual({ username: testUsername });
        expect(updateRequestArg.updates.$set).toEqual({ ...userUpdate });
        expect(updateRequestArg.updates.$push).toHaveProperty('sessionToken');
        expect(updateRequestArg.updates.$push).toEqual({ sessionToken: testSessionToken });
        expect(updateRequestArg.upsert).toBe(true);
    });
});
