import { baseRequestUrl, requests } from '../core/requests/requests';


const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BEPu-gOV_yG6r3CA730UXi4X8Md6IFbPUG-mZX9hVMXj_nmyUoO91_VRBYSoOKLgYYZYJ1HQ578MRgxMCwxXK1Y';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function sendSubscriptionToServer(subscription: PushSubscription) {
    return requests.post(`${baseRequestUrl}/subscription`, subscription);
}

async function subscribeToPush(swReg: ServiceWorkerRegistration) {
    const subscription = await swReg.pushManager.subscribe({
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        userVisibleOnly: true,
    });
    sendSubscriptionToServer(subscription);
}

async function setupSubscription() {
    const swReg = await navigator.serviceWorker.ready;

    if (!('showNotification' in swReg)) {
        console.warn('Notifications aren\'t supported.');
        return;
    }
    if (Notification.permission === 'denied') {
        console.warn('The user has blocked notifications.');
        return;
    }
    if (!('PushManager' in window)) {
        console.warn('Push messaging isn\'t supported.');
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.warn('The user has not granted notifications.');
        return;
    }

    const subscription = await swReg.pushManager.getSubscription();

    if (!subscription){
        console.log('No Subscription endpoint present');
        subscribeToPush(swReg);
    }
}

export default setupSubscription;
