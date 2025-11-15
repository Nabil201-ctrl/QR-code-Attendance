import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function generateDeviceFingerprint(): Promise<string> {
  try {
    let deviceId = 'unknown';
    
    if (Platform.OS === 'android') {
      deviceId = await Application.getAndroidId() || 'unknown-android';
    } else if (Platform.OS === 'ios') {
      deviceId = await Application.getIosIdForVendorAsync() || 'unknown-ios';
    }
    
    const deviceType = Device.deviceType || Device.DeviceType.UNKNOWN;
    const brand = Device.brand || 'unknown';
    const model = Device.modelName || 'unknown';
    const osVersion = Device.osVersion || 'unknown';
    const deviceName = Device.deviceName || 'unknown';
    
    const fingerprintData = {
      deviceId,
      deviceType: deviceType.toString(),
      brand,
      model,
      osVersion,
      platform: Platform.OS,
      deviceName,
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
    const scanHistory = await AsyncStorage.getItem(key);
    return scanHistory !== null;
  } catch (error) {
    console.error('Error checking scan history:', error);
    return false;
  }
}

export async function markAsScannedToday(qrCode: string): Promise<void> {
  try {
    const today = new Date().toDateString();
    const key = `attendance-${today}-${qrCode}`;
    await AsyncStorage.setItem(key, JSON.stringify({
      scannedAt: new Date().toISOString(),
      qrCode,
    }));
  } catch (error) {
    console.error('Error saving scan history:', error);
  }
}