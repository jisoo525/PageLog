export const API_URL = 'http://localhost:3000/api';

export function toLocalDate(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('sv-SE');
}

export function toLocalMonth(value) { return toLocalDate(value).slice(0, 7); }

export function formatKoreanDate(value) {
  const date = toLocalDate(value);
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${year}. ${Number(month)}. ${Number(day)}.`;
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, { ...options, credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || '요청을 처리하지 못했어요.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function fetchRecords() {
  const data = await jsonFetch(`${API_URL}/records`);
  return Array.isArray(data) ? data : [];
}

export async function updateRecord(id, record) {
  return jsonFetch(`${API_URL}/records/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record),
  });
}

export async function deleteRecord(id) {
  return jsonFetch(`${API_URL}/records/${id}`, { method: 'DELETE' });
}

export async function createRecord(record) {
  return jsonFetch(`${API_URL}/records`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record),
  });
}

export async function fetchRecommendations() {
  const data = await jsonFetch(`${API_URL}/recommendations`);
  return Array.isArray(data) ? data : [];
}

export async function fetchGoal(year, month) {
  return jsonFetch(`${API_URL}/goals?year=${year}&month=${month}`);
}

export async function saveGoal(year, month, goal) {
  return jsonFetch(`${API_URL}/goals`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year, month, goal }),
  });
}

export function sortByCompleted(records) {
  return [...records].sort(
    (a, b) => toLocalDate(b.completed_at).localeCompare(toLocalDate(a.completed_at)) || (b.id || 0) - (a.id || 0)
  );
}
