import { ObjectId } from 'mongodb';
import webpush from 'web-push';

import { subscriptionFactory, userFactory } from '../../core/test-data';

import subscriptionRepo from '../../repositories/subscription-repository';

import { getUserById } from '../user-service';

import sendNotification from './send-notification';


jest.mock('web-push');
jest.mock('../user-service/get-user-by-id');

const mockedFind = jest.mocked(subscriptionRepo.find);
const mockedGetUserById = jest.mocked(getUserById);

describe('sendNotification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send notification for every subscription of that user', async () => {
        // Arrange
        // Feature flag enableNotificationFeature -- code line can be removed after go-live
        mockedGetUserById.mockResolvedValue(userFactory.build({ enableNotificationFeature: true }));
        const userId = new ObjectId();
        const expectedNotificationTitle = 'Some title';
        const expectedNotificationBody = 'Some notification body';
        const numSubscriptions = 3;
        const userSubscriptions = subscriptionFactory.buildList(numSubscriptions);
        mockedFind.mockResolvedValue(userSubscriptions);

        // Act
        await sendNotification({
            userId,
            title: expectedNotificationTitle,
            body: expectedNotificationBody,
        });

        // Assert
        const expectedString = JSON.stringify({
            notification: {
                title: expectedNotificationTitle,
                body: expectedNotificationBody,
            },
        });
        expect(webpush.sendNotification).toHaveBeenCalledTimes(numSubscriptions);
        expect(webpush.sendNotification).toHaveBeenCalledWith(userSubscriptions[0], expectedString);
    });
});
