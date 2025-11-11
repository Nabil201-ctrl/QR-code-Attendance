# QR Code Attendance System

This is a QR code attendance system with a student and admin app.

## API Endpoints

This document outlines the API endpoints required for the frontend application to function correctly.

### Student

#### `POST /api/attendance`

This endpoint is used by the student app to submit their attendance after scanning a QR code.

**Request Body:**

```json
{
  "name": "John Doe",
  "level": "100",
  "matricNumber": "12345",
  "fingerprint": "unique-device-id",
  "qrCode": "scanned-qr-code-data"
}
```

**Response:**

**Success (200):**


```json
{
  "message": "Attendance submitted successfully"
}
```

**Error (400):**

```json
{
  "error": "Invalid QR code"
}
```

### Admin

#### `GET /api/attendance`

This endpoint is used by the admin app to fetch the list of students who have checked in.

**Response:**

**Success (200):**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "level": "100",
    "matricNumber": "12345",
    "time": "10:00 AM"
  },
  {
    "id": 2,
    "name": "Jane Doe",
    "level": "200",
    "matricNumber": "67890",
    "time": "10:05 AM"
  }
]
```

#### `POST /api/qrcode`

This endpoint is used by the admin app to generate or regenerate a QR code.

**Response:**

**Success (200):**

```json
{
  "qrCode": "new-qr-code-string",
  "expiresIn": 60
}
```

This will generate a new QR code that is valid for 60 seconds. The frontend will use this `qrCode` string to display the QR code image. The `expiresIn` value is used to display a countdown timer.