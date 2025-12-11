import { API_BASE_URL } from "../constants/env";

export interface Student {
  _id: string;
  name: string;
  matricNumber: string;
  attendancePercentage: string;
  attendanceDetails: { date: string; status: number }[];
}

export interface AttendanceData {
  name: string;
  matricNumber: string;
  qrCode: string;
}

export interface QrCodeResponse {
  data: string;
  expiresAt: string;
  qrCodeId: string;
  purpose?: string;
}

export interface AttendanceResponse {
  students: Student[];
  allDates: { date: string; purpose?: string | null }[];
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
        'Cache-Control': 'no-cache',
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
      
      // Get response text first (works for both JSON and plain text)
      const responseText = await response.text();
      
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('❌ API Error Data:', errorData);
        } catch {
          // Not JSON, use the text as-is
          errorMessage = responseText || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
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
export async function generateQrCode(expiresIn: number, purpose: string): Promise<QrCodeResponse> {
  return apiFetch('/admin/qr-code', {
    method: 'POST',
    body: JSON.stringify({ expiresIn, purpose }),
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

export async function bulkAddStudents(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/admin/students/upload`;
    console.log('🌐 API Request (Bulk Upload):', {
        url,
        method: 'POST',
        timestamp: new Date().toISOString()
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        console.log('📡 API Response (Bulk Upload):', {
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
            } catch {
                const text = await response.text();
                errorMessage = text || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ API Success Data (Bulk Upload):', data);
        return data;
    } catch (error) {
        console.log('🚨 API Fetch Error (Bulk Upload):', error);
        throw error;
    }
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

export async function bulkDeleteStudents(studentIds: string[]): Promise<{ deleted: number; notFound: number; invalid: number; message: string }> {
  return apiFetch('/admin/students/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ studentIds }),
  });
}

export async function updateAttendance(studentId: string, date: string, status: number): Promise<{ message: string; record: unknown }> {
  return apiFetch(`/admin/attendance/${studentId}/${date}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// Test function to verify connection
export async function testConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing backend connection...');
    const students = await getStudents();
    console.log('✅ Backend connection successful! Found', students.length, 'students');
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.log('❌ Backend connection failed:', message);
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

export async function exportAttendanceCsv(): Promise<Response> {
  // Use regular fetch to get the raw response, not apiFetch
  // as apiFetch expects JSON and we need a blob for CSV
  const url = `${API_BASE_URL}/admin/attendance/export`;
  
  console.log('🌐 API Request for CSV:', {
    url,
    method: 'GET',
    timestamp: new Date().toISOString()
  });

  const response = await fetch(url, {
    method: 'GET',
  });

  console.log('📡 API Response for CSV:', {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response;
}