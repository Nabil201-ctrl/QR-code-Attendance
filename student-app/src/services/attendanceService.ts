import { API_BASE_URL } from "../constants/env";

export interface SubmitAttendancePayload {
  name: string;
  matricNumber: string;
  deviceFingerprint: string;
  qrCodeData: string;
}

export async function submitAttendance(payload: SubmitAttendancePayload) {
  const res = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    // Try to parse JSON error, otherwise fall back to text/status
    let message = `HTTP ${res.status} ${res.statusText}`;
    try {
      const json = await res.json();
      message = json.message || json.error || message;
    } catch (e) {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch (__) {
        // ignore
      }
    }
    throw new Error(message || 'Failed to submit attendance');
  }

  return res.json();
}