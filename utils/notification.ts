export const initNotification = () => {
  if (!Notification) {
    console.log("Desktop notifications are not available in your browser.");
    return;
  }
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
};
export const showNotification = function () {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  } else {
    const options: NotificationOptions = {
      body: "New DEX Pair detected.",
      dir: "ltr",
    };
    const notification = new Notification("New Pair detected!", options);
  }
};
