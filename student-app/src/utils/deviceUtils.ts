export async function generateDeviceFingerprint(): Promise<string> {
  try {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hardwareConcurrency = navigator.hardwareConcurrency || 'unknown';
    
    const fingerprintData = {
      userAgent,
      platform,
      language,
      timezone,
      hardwareConcurrency,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth.toString(),
    };

    // Create a hash-like string from the device data
    return Object.values(fingerprintData)
      .map(value => value.toString().replace(/\s+/g, '-').toLowerCase())
      .join('-');
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback to a random ID if device info fails
    return `fallback-${Math.random().toString(36).substr(2, 9)}`;
  }
}

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