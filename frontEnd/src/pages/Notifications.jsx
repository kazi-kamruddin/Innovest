import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiRefreshCw } from 'react-icons/fi';
import { useAuthContext } from '../hooks/useAuthContext';
import '../styles/notifications.css';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export default function Notifications() {
  const { user } = useAuthContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = localStorage.getItem('token')?.trim();
    if (!token || !API_BASE) { setError('Please sign in again.'); setLoading(false); return; }
    try {
      const response = await fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not load notifications.');
      setItems(data.items || []);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load notifications.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [load, user?.id]);

  async function markRead(id) {
    const token = localStorage.getItem('token')?.trim();
    try {
      const response = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Could not mark notification as read.');
      setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item));
      window.dispatchEvent(new Event('notifications-changed'));
    } catch (readError) { setError(readError.message); }
  }

  async function markAllRead() {
    const token = localStorage.getItem('token')?.trim();
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Could not mark notifications as read.');
      setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
      window.dispatchEvent(new Event('notifications-changed'));
    } catch (readError) { setError(readError.message); }
  }

  return <main className="iv-notifications-page">
    <div className="iv-notifications-wrap">
      <div className="iv-notifications-heading"><div><span>YOUR ACTIVITY</span><h1>Notifications</h1><p>Updates about pitches and conversations.</p></div>
        {items.some((item) => !item.read_at) && <button type="button" onClick={markAllRead}>Mark all as read</button>}
      </div>
      {error && <div className="iv-notifications-error" role="alert">{error} <button type="button" onClick={load}><FiRefreshCw /> Retry</button></div>}
      {loading ? <p>Loading notifications...</p> : !items.length ? <div className="iv-notifications-empty"><FiBell size={30} /><h2>All caught up</h2><p>Your updates will appear here.</p></div> :
        <div className="iv-notifications-list">{items.map((item) => <article key={item.id} className={`iv-notification-item ${item.read_at ? '' : 'unread'}`}>
          <div><p>{item.text}</p><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></div>
          <div className="iv-notification-actions"><Link to={item.target_path} onClick={() => { if (!item.read_at) markRead(item.id); }}>View</Link>
            {!item.read_at && <button type="button" onClick={() => markRead(item.id)}>Mark read</button>}</div>
        </article>)}</div>}
    </div>
  </main>;
}
