import { ObjectID, ObjectId } from 'mongodb';
import webpush from 'web-push';

import subscriptionRepo from '../../repositories/subscription-repository';

import { getUserById } from '../user-service';


interface NotificationData {
    title: string;
    body: string;
    image?: string;
    actions?: Array<{
        title: string;
        action: string;
    }>;
    data?: Record<string, string>;
}

interface NotificationPayload {
    notification: NotificationData;
}

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BEPu-gOV_yG6r3CA730UXi4X8Md6IFbPUG-mZX9hVMXj_nmyUoO91_VRBYSoOKLgYYZYJ1HQ578MRgxMCwxXK1Y',
    privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.warn('You must set VAPID keys to use Push Notifications');
} else {
    webpush.setVapidDetails(
        'mailto:smartlistmusic@gmail.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey,
    );
}

async function sendNotification({
    userId,
    notification,
}: {
    userId: string|ObjectID,
    notification: NotificationData,
}) {
    // Feature flag enableNotificationFeature -- code block can be removed after go-live
    const user = await getUserById(userId);
    if (!user.enableNotificationFeature) {
        console.debug(`Feature flag enableNotificationFeature is not enabled for userId = ${userId}`);
        return;
    }

    const subscriptions = await subscriptionRepo.find({
        conditions: { userId: new ObjectId(userId).toString() },
    });
    if (!subscriptions.length) {
        console.debug(`No subscriptions found for userId = ${userId}`);
        return;
    }
    const notificationData: NotificationPayload = { notification };
    subscriptions.map((subscription) => webpush.sendNotification(subscription, JSON.stringify(notificationData)));
}

export default sendNotification;
