
import { ExpoRequest, ExpoResponse } from 'expo-router/server';

let attendance: any[] = [];
let qrCode = `initial-qr-code-${Math.random()}`;
let qrCodeExpiresAt = Date.now() + 60000; // 60 seconds

function generateQrCode() {
  qrCode = `new-qr-code-${Math.random()}`;
  qrCodeExpiresAt = Date.now() + 60000; // 60 seconds
  return { qrCode, expiresIn: 60 };
}

export function GET(req: ExpoRequest) {
  return ExpoResponse.json(attendance);
}

export function POST(req: ExpoRequest) {
  const { name, level, matricNumber, fingerprint, qrCode: scannedQrCode } = req.body as any;

  if (scannedQrCode !== qrCode) {
    return ExpoResponse.json({ error: 'Invalid QR Code' }, { status: 400 });
  }

  if (Date.now() > qrCodeExpiresAt) {
    return ExpoResponse.json({ error: 'QR Code expired' }, { status: 400 });
  }

  const newAttendance = {
    id: attendance.length + 1,
    name,
    level,
    matricNumber,
    fingerprint,
    time: new Date().toLocaleTimeString(),
  };

  attendance.push(newAttendance);

  return ExpoResponse.json(newAttendance);
}

export function PUT(req: ExpoRequest) {
    const {qrCode, expiresIn} = generateQrCode();
    return ExpoResponse.json({qrCode, expiresIn});
}
