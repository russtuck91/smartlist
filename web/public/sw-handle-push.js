

self.addEventListener('push', function(e) {
    const dataObj = e.data.json();

    const notificationData = dataObj.notification;
    const notificationTitle = notificationData.title;
    const notificationOptions = {
        body: notificationData.body,
        icon: notificationData.image || 'favicon.ico',
    };

    e.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
});
