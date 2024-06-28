

self.addEventListener('push', function(e) {
    const dataObj = e.data.json();

    const notificationData = dataObj.notification;
    const notificationTitle = notificationData.title;
    const notificationOptions = {
        body: notificationData.body,

        // https://pushpad.xyz/blog/web-notifications-difference-between-icon-image-badge
        // `badge` is a very small icon that is usually displayed in the notification bar
        badge: notificationData.image || 'pwa-notification-badge.png',
        // `icon` usually represents the sender
        icon: notificationData.image || 'android-chrome-192x192.png',
        // `image` represents the main content of the notification

        actions: notificationData.actions,
        data: notificationData.data,
    };

    e.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
});

self.addEventListener('notificationclick', function(event) {
    event.waitUntil(self.clients.openWindow(event.notification.data.url));

    event.notification.close();
});
