const API_BASE_URL = 'http://localhost:3000'; // Assuming backend runs on port 3000

export interface SubmitAttendancePayload {
  name: string;
  matricNumber: string;
  fingerprint: string;
  qrCodeData: string; // Renamed from qrCode to match backend DTO
}

export async function submitAttendance(payload: SubmitAttendancePayload) {
  const res = await fetch(`${API_BASE_URL}/attendance`, { // Corrected endpoint
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
