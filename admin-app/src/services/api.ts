import { API_BASE_URL } from "../constants/env";

export interface Student {
  _id: string;
  name: string;
  matricNumber: string;
}

export interface AttendanceData {
  name: string;
  matricNumber: string;
  fingerprint: string;
  qrCode: string;
}

export interface QrCodeResponse {
  data: string;
  expiresAt: string;
  qrCodeId: string;
}

export interface AttendanceResponse {
  students: Array<{
    id: string;
    name: string;
    matricNumber: string;
    dates: { [date: string]: number };
  }>;
  allDates: string[];
}

// Enhanced fetch wrapper with debugging
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  console.log('🌐 API Request:', {
    url,
    method: options.method || 'GET',
    body: options.body,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      ok: response.ok
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.log('❌ API Error Data:', errorData);
      } catch {
        // If response is not JSON, use status text
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ API Success Data:', data);
    return data;

  } catch (error) {
    console.log('🚨 API Fetch Error:', error);
    
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on port 4000.');
    }
    
    throw error;
  }
}

// Attendance functions
export async function submitAttendance(data: AttendanceData) {
  return apiFetch('/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAttendance(): Promise<AttendanceResponse> {
  return apiFetch('/admin/attendance');
}

// QR Code functions
export async function generateQrCode(expiresIn: number): Promise<QrCodeResponse> {
  return apiFetch('/admin/qr-code', {
    method: 'POST',
    body: JSON.stringify({ expiresIn }),
  });
}

// Student functions
export async function getStudents(): Promise<Student[]> {
  return apiFetch('/admin/students');
}

export async function addStudent(studentData: { name: string; matricNumber: string }): Promise<Student> {
  return apiFetch('/admin/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  });
}

export async function updateStudent(studentId: string, studentData: Partial<Student>): Promise<Student> {
  return apiFetch(`/admin/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  });
}

export async function deleteStudent(studentId: string): Promise<void> {
  await apiFetch(`/admin/students/${studentId}`, {
    method: 'DELETE',
  });
}

// Test function to verify connection
export async function testConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing backend connection...');
    const students = await getStudents();
    console.log('✅ Backend connection successful! Found', students.length, 'students');
    return true;
  } catch (error: any) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
}

// Utility function to check if backend is reachable
export async function pingBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/students`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}