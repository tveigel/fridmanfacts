// src/lib/utils/time.ts
import { Timestamp } from 'firebase/firestore';

interface TranscriptEntry {
  time: string;
  [key: string]: any;
}

export const normalizeTime = (time: string): string => {
  const parts = time.split(":").map((part) => part.padStart(2, "0"));
  if (parts.length === 2) parts.unshift("00");
  else if (parts.length === 1) parts.unshift("00", "00");
  return parts.join(":");
};

export const timeStringToSeconds = (timeString: string): number => {
  const parts = timeString.split(":").map(Number);
  return parts.reduce((acc, part, index) => acc + part * 60 ** (2 - index), 0);
};

export const secondsToTimeString = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [
    String(hrs).padStart(2, "0"),
    String(mins).padStart(2, "0"),
    String(secs).padStart(2, "0"),
  ].join(":");
};

export const findMatchingEntryTime = (timestampTime: string, transcript: TranscriptEntry[]): string => {
  const normalizedTimestampTime = normalizeTime(timestampTime);
  const timeInSeconds = timeStringToSeconds(normalizedTimestampTime);

  const processedTranscript = transcript.map(entry => ({
    ...entry,
    cleanTime: normalizeTime(entry.time.replace(/[()]/g, "")),
  }));

  for (let i = 0; i <= 25; i++) {
    const searchTimeInSeconds = timeInSeconds + i;
    const searchTime = normalizeTime(secondsToTimeString(searchTimeInSeconds));
    const match = processedTranscript.find(entry => entry.cleanTime === searchTime);
    if (match) {
      return match.time;
    }
  }

  return normalizedTimestampTime;
};

export const serializeTimestamp = (timestamp: Timestamp | null | undefined): string | null => {
  if (!timestamp || !timestamp.toMillis) return null;
  return timestamp.toMillis().toString();
};

export const serializeFirebaseData = <T extends Record<string, any>>(data: T): Record<string, any> => {
  const serialized = { ...data };
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object') {
      if (value instanceof Timestamp) {
        serialized[key] = serializeTimestamp(value);
      } else if (value.toJSON || value.toDate) {  // Handle Firebase types
        serialized[key] = serializeTimestamp(value);
      } else if (Array.isArray(value)) {
        serialized[key] = value.map(item => 
          typeof item === 'object' ? serializeFirebaseData(item) : item
        );
      } else if (typeof value === 'object') {
        serialized[key] = serializeFirebaseData(value);
      }
    }
  }
  return serialized;
};