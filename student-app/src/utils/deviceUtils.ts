export async function hasScannedToday(qrCode: string): Promise<boolean> {
  try {
    const today = new Date().toDateString();
    const key = `attendance-${today}-${qrCode}`;
    const hasScanned = localStorage.getItem(key);
    return hasScanned !== null;
  } catch (error) {
    console.error('Error checking scan history:', error);
    return false;
  }
}

export async function markAsScannedToday(qrCode: string): Promise<void> {
  try {
    const today = new Date().toDateString();
    const key = `attendance-${today}-${qrCode}`;
    localStorage.setItem(key, JSON.stringify({
      scannedAt: new Date().toISOString(),
      qrCode,
    }));
  } catch (error) {
    console.error('Error saving scan history:', error);
  }
}