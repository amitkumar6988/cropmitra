import React, { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../libs/axios";

const TYPE_ICON = {
  BID_ACCEPTED:  "✅",
  BID_REJECTED:  "❌",
  COUNTER_OFFER: "💬",
  ORDER_UPDATE:  "📦",
  BID_UPDATED:   "✏️",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [open, setOpen]                   = useState(false);
  const ref = useRef(null);

  const fetchNotifications = () => {
    axiosInstance.get("/notifications")
      .then(res => {
        setNotifications(res.data.notifications ?? []);
        setUnread(res.data.unreadCount ?? 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await axiosInstance.put("/notifications/read-all").catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const markRead = async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative text-xl hover:scale-110 transition"
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs
            px-1.5 rounded-full leading-tight min-w-[18px] text-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-80 bg-white rounded-2xl shadow-2xl
          border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-green-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-gray-50 transition
                    ${n.isRead ? "opacity-60" : "bg-green-50/40"}`}
                >
                  <span className="text-lg flex-shrink-0">{TYPE_ICON[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
