export function showNotification(message: string, type: "success" | "error" = "success") {
  const notification = {
    id: Date.now().toString(),
    message,
    type,
  }

  // Trigger the subscription
  const listener = (window as any).__notificationListener
  if (listener) {
    listener(notification)
  } else {
    // Fallback if listener not ready
    setTimeout(() => {
      const retryListener = (window as any).__notificationListener
      if (retryListener) {
        retryListener(notification)
      }
    }, 100)
  }
}
