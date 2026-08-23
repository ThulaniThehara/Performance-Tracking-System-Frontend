import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";
import { isLoggedIn } from "../utils/auth";

const POLL_INTERVAL_MS = 25000;

/**
 * Polls GET /api/notifications on an interval so the bell badge in Header
 * stays current without a persistent connection. 25s keeps the delay small
 * enough for "task assigned" / "deadline near" style alerts while adding
 * negligible load for an app this size.
 */
export default function useNotifications() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await apiFetch("/notifications");
      setItems(res?.data?.items || []);
      setUnreadCount(res?.data?.unreadCount || 0);
    } catch {
      // Polling failures shouldn't surface as user-facing errors; the next
      // tick will just try again.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) return;
    refresh();
    timerRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  const markRead = useCallback(async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
    } catch {
      refresh();
    }
  }, [refresh]);

  return { items, unreadCount, loading, refresh, markRead, markAllRead };
}
