"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"

interface Notification {
  id: string
  message: string
  type: "success" | "error"
}

let notificationListener: ((notification: Notification) => void) | null = null

export function subscribeToNotifications(callback: (notification: Notification) => void) {
  notificationListener = callback
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    subscribeToNotifications((notification) => {
      setNotifications((prev) => [...prev, notification])
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 3000)
    })
  }, [])

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-[100]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
            notification.type === "success"
              ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
              : "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
          }`}
        >
          {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
