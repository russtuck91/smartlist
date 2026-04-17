import subscriptionRepo from '../../repositories/subscription-repository';

import { getCurrentUser } from '../user-service';


async function saveSubscription(subscriptionValue) {
    const user = await getCurrentUser();
    const subscription = {
        ...subscriptionValue,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    return subscriptionRepo.create(subscription);
}

export default saveSubscription;
