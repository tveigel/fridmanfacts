// Normalize time formats to "HH:MM:SS"
export const normalizeTime = (time) => {
    const parts = time.split(":").map((part) => part.padStart(2, "0"));
    if (parts.length === 2) parts.unshift("00");
    else if (parts.length === 1) parts.unshift("00", "00");
    return parts.join(":");
  };
  
  // Convert time string to total seconds
  export const timeStringToSeconds = (timeString) => {
    const parts = timeString.split(":").map(Number);
    return parts.reduce((acc, part, index) => acc + part * 60 ** (2 - index), 0);
  };
  
  // Convert total seconds back to time string
  export const secondsToTimeString = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      String(hrs).padStart(2, "0"), // Ensure hours are padded to two digits
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  };
  
  export const findMatchingEntryTime = (timestampTime, transcript) => {
    // Normalize the input timestamp time
    const normalizedTimestampTime = normalizeTime(timestampTime);
    const timeInSeconds = timeStringToSeconds(normalizedTimestampTime);

  
    // Preprocess transcript times (strip parentheses and normalize)
    const processedTranscript = transcript.map(entry => ({
      ...entry,
      cleanTime: normalizeTime(entry.time.replace(/[()]/g, "")), // Strip parentheses and normalize
    }));
  
  
    // Loop to find a match, incrementing time in seconds
    for (let i = 0; i <= 25; i++) {
      const searchTimeInSeconds = timeInSeconds + i; // Increment the time
      const searchTime = normalizeTime(secondsToTimeString(searchTimeInSeconds)); // Convert back to HH:MM:SS
  
      // Search for a match in the transcript
      const match = processedTranscript.find(entry => entry.cleanTime === searchTime);
      if (match) {
        console.log("Match Found at Increment:", i, "Search Time:", searchTime, "Entry:", match);
        return match.time; // Return the matching entry time
      }
    }

    return normalizedTimestampTime; // Fallback to the normalized input timestamp time
  };
  