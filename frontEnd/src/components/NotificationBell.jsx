import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { useAuthContext } from '../hooks/useAuthContext';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function NotificationBell({ mobile = false, onClick }) {
  const { user } = useAuthContext();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user?.id || !API_BASE) return undefined;
    const token = localStorage.getItem('token')?.trim();
    if (!token) return undefined;
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return;
        const data = await response.json();
        if (active) setUnread(Number(data.unread) || 0);
      } catch { /* The next poll retries. */ }
    };
    refresh();
    const timer = window.setInterval(refresh, 30000);
    const socket = io(API_BASE, { auth: { token } });
    socket.on('notification', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('notifications-changed', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      socket.disconnect();
      window.removeEventListener('focus', refresh);
      window.removeEventListener('notifications-changed', refresh);
    };
  }, [user?.id]);

  if (!user) return null;
  return <Link to="/notifications" onClick={onClick} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
    className={mobile ? 'iv-notification-mobile-link' : 'iv-notification-bell'}>
    <FiBell size={19} aria-hidden="true" />
    {mobile && <span>Notifications</span>}
    {unread > 0 && <span className="iv-notification-count">{unread > 99 ? '99+' : unread}</span>}
  </Link>;
}
