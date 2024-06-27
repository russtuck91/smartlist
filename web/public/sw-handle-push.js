

self.addEventListener('push', function(e) {
    const dataObj = e.data.json();

    const notificationData = dataObj.notification;
    const notificationTitle = notificationData.title;
    const notificationOptions = {
        body: notificationData.body,
        badge: notificationData.image || 'pwa-notification-badge.png',
        icon: notificationData.image || 'favicon.ico',
        actions: notificationData.actions,
        data: notificationData.data,
    };

    e.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
});

self.addEventListener('notificationclick', function(event) {
    event.waitUntil(self.clients.openWindow(event.notification.data.url));

    event.notification.close();
});
