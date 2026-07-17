import type { RecordItem, RecordInput, Summary } from '../types.ts';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || `请求失败 (${res.status})`);
  }
  return body.data as T;
}

export function getRecords(): Promise<RecordItem[]> {
  return request<RecordItem[]>('/api/records');
}

export function getSummary(): Promise<Summary> {
  return request<Summary>('/api/summary');
}

export function createRecord(input: RecordInput): Promise<RecordItem> {
  return request<RecordItem>('/api/records', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateRecord(id: number, input: RecordInput): Promise<RecordItem> {
  return request<RecordItem>(`/api/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteRecord(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/records/${id}`, {
    method: 'DELETE',
  });
}
