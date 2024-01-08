import { ObjectId } from 'mongodb';
import webpush from 'web-push';

import { subscriptionFactory } from '../../core/test-data';

import subscriptionRepo from '../../repositories/subscription-repository';

import sendNotification from './send-notification';


jest.mock('web-push');

const mockedFind = jest.mocked(subscriptionRepo.find);

describe('sendNotification', () => {
    it('should send notification for every subscription of that user', async () => {
        // Arrange
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
