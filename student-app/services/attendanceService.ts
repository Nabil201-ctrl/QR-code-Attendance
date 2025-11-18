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
    const error = await res.json();
    throw new Error(error.message || 'Failed to submit attendance');
  }

  return res.json();
}
