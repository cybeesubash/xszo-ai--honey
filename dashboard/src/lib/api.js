// In dev, Vite proxy forwards all API calls to the FastAPI backend (same origin).
// In production, set VITE_API_URL to your deployed backend URL.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function getWsBase() {
  if (import.meta.env.DEV) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}`;
  }
  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  return base.replace(/^http/, 'ws');
}

export const WS_BASE = typeof window !== 'undefined' ? getWsBase() : 'ws://127.0.0.1:8000';

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    return res;
  } catch (err) {
    console.error(`API fetch failed: ${path}`, err);
    return null;
  }
}

export function severityBadgeClass(severity) {
  const s = (severity || 'low').toLowerCase();
  return `badge badge-${s}`;
}

export function formatTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export async function fetchHealth() {
  const res = await apiFetch('/health');
  return res?.ok ? res.json() : null;
}

export async function fetchStats() {
  const res = await apiFetch('/stats');
  return res?.ok ? res.json() : null;
}

export async function fetchLogs(limit = 100) {
  const res = await apiFetch(`/logs?limit=${limit}`);
  return res?.ok ? res.json() : [];
}

export async function fetchTimeline(hours = 24) {
  const res = await apiFetch(`/timeline?hours=${hours}`);
  return res?.ok ? res.json() : [];
}

export async function fetchDevices() {
  const res = await apiFetch('/devices');
  return res?.ok ? res.json() : [];
}

export async function fetchAdvisor(ip) {
  const res = await apiFetch(`/chat/${encodeURIComponent(ip)}`);
  return res?.ok ? res.json() : null;
}

export async function sendChatMessage(ip, message) {
  const res = await apiFetch(`/chat/${encodeURIComponent(ip)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return res?.ok ? res.json() : null;
}

export async function sendGlobalChat(message) {
  const res = await apiFetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return res?.ok ? res.json() : null;
}

export async function sendTestEvent() {
  const res = await apiFetch('/api/demo/event', { method: 'POST' });
  if (!res) return { ok: false, error: 'Backend unreachable' };
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    return { ok: false, error: err.detail || 'Request failed' };
  }
  return { ok: true, data: await res.json() };
}

export async function fetchIpInfo(ip) {
  const res = await apiFetch(`/api/ipinfo/${encodeURIComponent(ip)}`);
  return res?.ok ? res.json() : null;
}

export async function blockIpAddress(ip) {
  const res = await apiFetch('/api/mitigate/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip }),
  });
  return res?.ok ? res.json() : null;
}

export async function sendTelegramIpReport(ip) {
  const res = await apiFetch(`/api/mitigate/telegram/${encodeURIComponent(ip)}`, {
    method: 'POST',
  });
  return res?.ok ? res.json() : null;
}

export { API_BASE };

