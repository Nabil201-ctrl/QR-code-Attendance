const API_BASE_URL = 'http://localhost:3000';

export interface Student {
  _id: string;
  name: string;
  matricNumber: string;
}

export interface AttendanceData {
  name: string;
  level: string; // This will be removed from the frontend later
  matricNumber: string;
  fingerprint: string;
  qrCode: string;
}

export async function submitAttendance(data: AttendanceData) {
  const res = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to submit attendance');
  }

  return res.json();
}

export async function getAttendance() {
  const res = await fetch(`${API_BASE_URL}/admin/attendance`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch attendance');
  }

  return res.json();
}

export async function generateQrCode(expiresIn: number) {
  const res = await fetch(`${API_BASE_URL}/admin/qr-code`, {
    method: 'POST',
    body: JSON.stringify({ expiresIn }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to generate QR Code');
  }

  return res.json();
}

export async function getStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE_URL}/admin/students`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch students');
  }

  return res.json();
}
